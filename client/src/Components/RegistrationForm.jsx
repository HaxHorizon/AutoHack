import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = [
  "Web Development",
  "Mobile Apps",
  "AI/ML",
  "Blockchain",
  "IoT",
];

function RegistrationForm() {
  const [formData, setFormData] = useState({
    teamName: "",
    category: categories[0],
    members: [
      { name: "", email: "" },
      { name: "", email: "" },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("member")) {
      const [_, index, field] = name.split("_");
      const updatedMembers = [...formData.members];
      updatedMembers[Number(index)][field] = value;
      setFormData({ ...formData, members: updatedMembers });
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

    for (let i = 0; i < formData.members.length; i++) {
      if (!formData.members[i].name.trim()) {
        toast.error(`Please enter a name for team member ${i + 1}`);
        return;
      }
      if (!formData.members[i].email.trim()) {
        toast.error(`Please enter an email for team member ${i + 1}`);
        return;
      }
    }

    try {
      const response = await axios.post("http://localhost:4000/api/register", formData);
      toast.success("Registration successful!");

      setFormData({
        teamName: "",
        category: categories[0],
        members: [
          { name: "", email: "" },
          { name: "", email: "" },
        ],
      });
      console.log("Server response:", response.data);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("There was an error submitting the form.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8"
      >
        <ToastContainer />

        <h2 className="text-3xl font-bold text-center mb-6">Build-a-thon Registration</h2>

        {/* Team Details */}
        <div className="mb-6">
          <span className="block text-lg font-semibold text-gray-700 mb-2">
            Team Details
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Team Name
              </label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Member Details */}
        <div>
          <span className="block text-lg font-semibold text-gray-700 mb-4">
            Member Details
          </span>
          {formData.members.map((member, index) => (
            <div
              key={index}
              className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <span className="block text-sm font-semibold text-gray-700 mb-3">
                {index === 0 ? "Team Leader" : `Member ${index + 1}`}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name={`member_${index}_name`}
                    value={member.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name={`member_${index}_email`}
                    value={member.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default RegistrationForm;
