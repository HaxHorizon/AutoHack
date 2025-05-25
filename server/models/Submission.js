const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  team_name: String,
  email: String,
  pdf_url: String,
  scores: {
    Clarity: Number,
    Structure: Number,
    Originality: Number,
    Grammar: Number,
    Relevance: Number,
  },
  analysis_summary: String,
  submitted_at: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'selected', 'rejected'],
    default: 'pending',
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
