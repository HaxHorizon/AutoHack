import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PDFSubmissionForm() {
  const [formData, setFormData] = useState({
    teamName: "",
    email: "",
    pdf: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pdf") {
      const file = files[0];
      if (file && file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        return;
      }
      setFormData({ ...formData, pdf: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.teamName.trim()) {
      toast.error("Please enter a team name.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter a valid email.");
      return;
    }

    if (!formData.pdf) {
      toast.error("Please upload your team details as a PDF.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("teamName", formData.teamName);
      data.append("email", formData.email);
      data.append("pdf", formData.pdf);

      const response = await axios.post("http://localhost:5000/api/submit-pdf", data);

      toast.success("PDF submitted successfully!");

      console.log("Server response:", response.data);


      setFormData({ teamName: "", email: "", pdf: null });
      document.getElementById("pdf-input").value = "";
    } catch (error) {
      console.error("Submission error:", error);
      const errMsg =
        error.response?.data?.error || "There was an error submitting the form.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8"
      >
        <ToastContainer />

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Team PDF Submission
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            type="text"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            required
            placeholder="Enter your team name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload PDF
          </label>
          <input
            id="pdf-input"
            type="file"
            name="pdf"
            accept="application/pdf"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-medium py-2 rounded-md transition ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit PDF"}
        </button>
      </form>
    </div>
  );
}

export default PDFSubmissionForm;
