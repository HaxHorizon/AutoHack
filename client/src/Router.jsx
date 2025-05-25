import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import RegistrationForm from "./Components/RegistrationForm";
import PDFSubmissionForm from "./Components/Submission";
import AdminDashboard from "./Components/AdminDashboard";

function RouterComponent() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/" element={<h1>Welcome to the Hackathon</h1>} />
        <Route path="/submit" element={<PDFSubmissionForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default RouterComponent;