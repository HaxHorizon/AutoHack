const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendSelectionEmail(email, teamName, teamLeaderName) {
  const mailOptions = {
    from: `"Build-a-thon Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 Team ${teamName} Selected for Build-a-thon Finals!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
            <h2>🎯 Congratulations Team ${teamName}!</h2>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${teamLeaderName}</strong>,</p>
            <p>We are excited to inform you that <strong>Team "${teamName}"</strong> has been <span style="color: #16a34a;"><strong>SELECTED</strong></span> for the next round of the Build-a-thon competition!</p>

            <p>Our panel was impressed with your submission and problem-solving approach. We can't wait to see what you build next!</p>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>📅 Final round details will be shared via email shortly.</li>
              <li>💬 Join the official WhatsApp group (link coming soon).</li>
              <li>🛠️ Prepare your demo and pitch presentation.</li>
            </ul>

            <p>If you have any questions, feel free to reach out.</p>

            <p>Congratulations once again, and best of luck! 🚀</p>

            <p>– Build-a-thon Organizing Team</p>
          </div>
          <div style="background: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #6b7280;">
            This is an automated email. Please do not reply directly.
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendSelectionEmail;
