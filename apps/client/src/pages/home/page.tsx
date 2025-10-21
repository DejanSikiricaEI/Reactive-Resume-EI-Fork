import { Navigate } from "react-router";

export const HomePage = () => {
  // Redirect to dashboard resumes
  return <Navigate replace to="/dashboard/resumes" />;
};
