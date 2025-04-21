
import { runDataMigration, migrateMockData } from "./data-migration";

export const initializeSystem = async () => {
  // Check if migration is needed and run it
  const result = await runDataMigration();
  return result;
};

// Export migrateMockData for backward compatibility
export { migrateMockData };
