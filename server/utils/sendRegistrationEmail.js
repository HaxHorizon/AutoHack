const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const categoryPS = {
  "Web Development": [
    "Build a collaborative whiteboard app with real-time updates.",
    "Create a student portfolio builder for college projects.",
    "Develop a decentralized blog platform.",
    "Create an online exam portal with anti-cheating mechanisms.",
    "Build a low-code website builder using drag-and-drop.",
  ],
  "Mobile Apps": [
    "Develop a fitness tracking app with social challenges.",
    "Create an AI-based personal finance tracker.",
    "Build a campus navigation app with AR.",
    "Design an app for visually impaired users with voice control.",
    "Create a digital queue management system for local shops.",
  ],
  "AI/ML": [
    "Create a model that classifies handwritten digits using CNNs.",
    "Build a chatbot for mental health support using NLP.",
    "Predict crop yield using weather and soil data.",
    "Detect fake news using machine learning.",
    "Develop a facial recognition attendance system.",
  ],
  "Blockchain": [
    "Build a voting system with transparent ledger-based results.",
    "Create a decentralized file storage system.",
    "Design a supply chain tracker using blockchain.",
    "Develop a blockchain-based certificate verification system.",
    "Create a crowdfunding platform using smart contracts.",
  ],
  "IoT": [
    "Design a smart farming sensor dashboard with remote access.",
    "Create a home automation system using voice commands.",
    "Develop a real-time pollution monitoring system.",
    "Build a smart parking solution with occupancy sensors.",
    "Implement an IoT-based water leakage detector.",
  ],
};

function getRandomPS(category) {
  const list = categoryPS[category] || [];
  return list[Math.floor(Math.random() * list.length)];
}

async function sendTeamLeadEmail(email, teamName, category, teamLeaderName, members) {
  const ps = getRandomPS(category);

  // Create a formatted HTML list of team members
  const membersListHTML = members
    .map(
      (member, idx) =>
        `<li><strong>${idx === 0 ? "Team Leader" : "Member " + (idx + 1)}:</strong> ${member.name} (${member.email})</li>`
    )
    .join("");

  const mailOptions = {
    from: `"Build-a-thon Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎯 Build-a-thon Registration Confirmation – Team ${teamName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h2>🎉 Welcome to Build-a-thon!</h2>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${teamLeaderName}</strong>,</p>
            <p>Thank you for registering <strong>Team "${teamName}"</strong> for the Build-a-thon. We are thrilled to have your team participate!</p>
            
            <p><strong>Selected Category:</strong> <span style="color: #2563eb;">${category}</span></p>
            
            <p><strong>Your Problem Statement:</strong></p>
            <blockquote style="margin: 12px 0; padding: 12px; background: #f1f5f9; border-left: 4px solid #2563eb;">
              ${ps}
            </blockquote>

            <p><strong>Team Members:</strong></p>
            <ul style="list-style-type:none; padding-left:0; margin-top: 0; margin-bottom: 1.5em;">
              ${membersListHTML}
            </ul>

            <p>Stay connected for further updates and instructions. If you have any questions, please don't hesitate to reach out.</p>
            
            <p>Best of luck, and let's innovate together! 🚀</p>
            
            <p>– Build-a-thon Organizing Team</p>
          </div>
          <div style="background: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #6b7280;">
            This is an automated email from Team HaxHorizon. Please do not reply directly.
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendTeamLeadEmail;
