const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sk7762415@gmail.com",
    pass: "dqiirtqeelgqmzqb",
  },
});

async function sendVerificationEmail(email, token) {
  const verificationUrl = `http://localhost:4000/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
  });
}

module.exports = sendVerificationEmail;
