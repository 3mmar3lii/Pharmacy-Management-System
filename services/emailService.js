const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  // If the user hasn't set up Google OAuth yet, fallback to Ethereal Testing!
  if (!process.env.GMAIL_CLIENT_ID || process.env.GMAIL_CLIENT_ID === "your_client_id_here") {
    console.log("⚠️ Google OAuth not configured in .env. Falling back to Ethereal Mail...");
    let testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
  }

  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :( " + err);
      }
      resolve(token);
    });
  });

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      accessToken,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
};

const sendEmail = async ({ email, subject, html }) => {
  const transporter = await createTransporter();
  const mailOptions = {
    from: process.env.GMAIL_USER || '"Pharmacy Bot" <test@example.com>',
    to: email,
    subject: subject,
    html: html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If using Ethereal, log the preview link so the user can test their flow!
  if (info.messageId && !process.env.GMAIL_CLIENT_ID || process.env.GMAIL_CLIENT_ID === "your_client_id_here") {
    console.log("-----------------------------------------");
    console.log("📨 TEST EMAIL SENT! VIEW IT HERE:");
    console.log(nodemailer.getTestMessageUrl(info));
    console.log("-----------------------------------------");
  }
};

module.exports = sendEmail;
