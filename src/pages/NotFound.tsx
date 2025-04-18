import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MobileLayout>
      <div className="container h-full flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-16 w-16 text-status-maintenance mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! Page not found
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="w-full max-w-xs"
        >
          Return to Home
        </Button>
      </div>
    </MobileLayout>
  );
};

export default NotFound;
