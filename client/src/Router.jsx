import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import RegistrationForm from "./Components/RegistrationForm";
import PDFSubmissionForm from "./Components/Submission";
import AdminDashboard from "./Components/AdminDashboard";
import AdminLogin from "./Components/Adminlogin";
import ProtectedAdminRoute from "./Components/ProtectedAdminRoute";

function RouterComponent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Welcome to the Hackathon</h1>} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/submit" element={<PDFSubmissionForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default RouterComponent;
