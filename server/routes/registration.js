const express = require("express");
const router = express.Router();
const sendTeamLeadEmail = require("../utils/sendRegistrationEmail");  // your mailer module
const Registration = require("../models/Registration"); // your Mongoose model

router.post("/", async (req, res) => {
  try {
    const { teamName, category, members } = req.body;


    if (!teamName || !category || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Invalid registration data." });
    }


    const newRegistration = new Registration({ teamName, category, members });
    await newRegistration.save();

    const teamLeader = members[0];
    if (!teamLeader || !teamLeader.name || !teamLeader.email) {
      return res.status(400).json({ message: "Invalid team leader data." });
    }


    await sendTeamLeadEmail(
      teamLeader.email,
      teamName,
      category,
      teamLeader.name,
      members
    );

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
