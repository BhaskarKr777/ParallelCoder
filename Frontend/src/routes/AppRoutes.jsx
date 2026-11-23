import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Terms from "../pages/Terms";
import Dashboard from "../pages/Dashboard";
import Editor from "../pages/Editor";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:workspaceId" element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;