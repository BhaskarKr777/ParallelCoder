import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Editor from "../pages/Editor";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Editor Workspace */}
        <Route path="/editor" element={<Editor />} />

        {/* Future Dynamic Workspace Route */}
        {/* <Route path="/workspace/:workspaceId" element={<Editor />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;