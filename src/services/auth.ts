
import { query } from './db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

export interface Session {
  user: User;
  token: string;
  expires_at: Date;
}

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

// Register a new user
export async function signUp({ 
  email, 
  password, 
  firstName, 
  lastName 
}: { 
  email: string; 
  password: string; 
  firstName?: string; 
  lastName?: string;
}): Promise<{ user: User | null; error: Error | null }> {
  try {
    // Check if user already exists
    const existingUser = await query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      return { user: null, error: new Error('User already exists') };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    // Insert user
    await query(
      'INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [userId, email, hashedPassword]
    );
    
    // Create profile
    await query(
      'INSERT INTO profiles (id, first_name, last_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userId, firstName || null, lastName || null, 'client']
    );
    
    // Get the user
    const user = {
      id: userId,
      email,
      first_name: firstName || null,
      last_name: lastName || null,
      role: 'client'
    };
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
}

// Sign in a user
export async function signIn({ 
  email, 
  password 
}: { 
  email: string; 
  password: string;
}): Promise<{ session: Session | null; error: Error | null }> {
  try {
    // Find user
    const users = await query<any[]>('SELECT u.id, u.email, u.password_hash, p.first_name, p.last_name, p.role FROM users u LEFT JOIN profiles p ON u.id = p.id WHERE u.email = ?', [email]);
    
    if (users.length === 0) {
      return { session: null, error: new Error('Invalid credentials') };
    }
    
    const user = users[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return { session: null, error: new Error('Invalid credentials') };
    }
    
    // Create session
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration
    
    await query(
      'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())',
      [uuidv4(), user.id, token, expiresAt]
    );
    
    // Create session object
    const session: Session = {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || 'client'
      },
      token,
      expires_at: expiresAt
    };
    
    // Store token in localStorage
    const localStorage = getLocalStorage();
    if (localStorage) {
      localStorage.setItem('auth_token', token);
    }
    
    return { session, error: null };
  } catch (error) {
    return { session: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
}

// Sign out a user
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const localStorage = getLocalStorage();
    const token = localStorage ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      // Remove token from database
      await query('DELETE FROM sessions WHERE token = ?', [token]);
      
      // Remove token from localStorage
      if (localStorage) {
        localStorage.removeItem('auth_token');
      }
    }
    
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
}

// Get current session
export async function getSession(): Promise<{ session: Session | null; error: Error | null }> {
  try {
    const localStorage = getLocalStorage();
    const token = localStorage ? localStorage.getItem('auth_token') : null;
    
    if (!token) {
      return { session: null, error: null };
    }
    
    // Find session
    const sessions = await query<any[]>(
      `SELECT s.token, s.expires_at, u.id, u.email, p.first_name, p.last_name, p.role 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN profiles p ON u.id = p.id 
       WHERE s.token = ? AND s.expires_at > NOW()`, 
      [token]
    );
    
    if (sessions.length === 0) {
      if (localStorage) {
        localStorage.removeItem('auth_token');
      }
      return { session: null, error: null };
    }
    
    const session = sessions[0];
    
    return {
      session: {
        user: {
          id: session.id,
          email: session.email,
          first_name: session.first_name,
          last_name: session.last_name,
          role: session.role || 'client'
        },
        token: session.token,
        expires_at: new Date(session.expires_at)
      },
      error: null
    };
  } catch (error) {
    return { session: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
}
