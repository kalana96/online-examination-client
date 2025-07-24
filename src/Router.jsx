import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import App from "./App";
import Dashboard from "./screens/admin/AdminDashboard";
import Class from "./pages/Class";

const AppRouter = () => {
  return (
    <Routes>
      <Route exact path="/" element={<Dashboard />} />
      <Route exact path="/class" element={<Class />} />
    </Routes>
  );
};

export default AppRouter;
