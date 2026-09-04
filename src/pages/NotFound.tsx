import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Determine the type of access issue
  const isAdminRoute = location.pathname.includes("/admin");
  const isProtectedRoute =
    location.pathname.includes("/checkout") ||
    location.pathname.includes("/order") ||
    location.pathname.includes("/abud/profile/edit") ||
    location.pathname.includes("/abud/business/edit") ||
    location.pathname.includes("/abud/chat") ||
    location.pathname.includes("/abud/settings");

  useEffect(() => {
    if (loading) return;

    let errorContext = "404 Error";
    if (!user && (isProtectedRoute || isAdminRoute)) {
      errorContext = "Access Denied (Not Authenticated)";
    } else if (user && isAdminRoute) {
      errorContext = "Access Denied (Insufficient Privileges)";
    }

    console.error(
      `${errorContext}: User attempted to access route:`,
      location.pathname
    );
  }, [location.pathname, user, loading, isProtectedRoute, isAdminRoute]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine appropriate message based on context
  let title = "404";
  let message = "Oops! Page not found";
  let actionButton = (
    <Link to="/abud">
      <Button>Return to Home</Button>
    </Link>
  );

  if (!user && (isProtectedRoute || isAdminRoute)) {
    title = "Authentication Required";
    message = "Please log in to access this page";
    actionButton = (
      <div className="flex gap-4 justify-center">
        <Link to="/abud/auth">
          <Button>Log In</Button>
        </Link>
        <Link to="/abud">
          <Button variant="outline">Return to Home</Button>
        </Link>
      </div>
    );
  } else if (user && isAdminRoute) {
    title = "Access Denied";
    message = "This page requires admin privileges";
    actionButton = (
      <Link to="/abud">
        <Button>Return to Home</Button>
      </Link>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold mb-4 text-foreground">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{message}</p>
        {actionButton}
      </div>
    </div>
  );
};

export default NotFound;
