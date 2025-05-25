const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");

// GET all submissions
router.get("/", async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ submitted_at: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// PUT update submission status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['selected', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const updated = await Submission.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Submission not found' });

    // TODO: Add email sending logic here

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
