import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ================= TRANSPORT =================
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= BASE TEMPLATE =================
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>PlaceMentor</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Segoe UI,Arial,sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 10px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" 
          style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:25px;text-align:center;color:#fff;">
              <h1 style="margin:0;font-size:22px;">PlaceMentor 🚀</h1>
              <p style="margin:5px 0 0;font-size:13px;">Grow your career smarter</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px;text-align:center;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px;text-align:center;font-size:12px;color:#999;background:#fafafa;">
              © ${new Date().getFullYear()} PlaceMentor <br/>
              Made with ❤️ in India
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;


// ================= SIGNUP OTP =================
export const sendSignupOtpMail = async (email, otp) => {
  const content = `
    <h2 style="margin:0;color:#333;">Verify Your Email 🎉</h2>
    <p style="color:#555;font-size:14px;">
      Use this OTP to complete your signup
    </p>

    <div style="
      font-size:26px;
      font-weight:bold;
      letter-spacing:6px;
      color:#4f46e5;
      margin:20px 0;
      padding:14px 24px;
      border:2px dashed #4f46e5;
      display:inline-block;
      border-radius:10px;
    ">
      ${otp}
    </div>

    <p style="font-size:12px;color:#888;">
      OTP valid for 5 minutes
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "🎉 Verify Your Email - PlaceMentor",
    html: baseTemplate(content),
  });
};


// ================= RESET OTP =================
export const sendResetOtpMail = async (email, otp) => {
  const content = `
    <h2 style="color:#e11d48;">Reset Password 🔒</h2>
    <p style="color:#555;font-size:14px;">
      Use this OTP to reset your password
    </p>

    <div style="
      font-size:26px;
      font-weight:bold;
      letter-spacing:6px;
      color:#e11d48;
      margin:20px 0;
      padding:14px 24px;
      border:2px dashed #e11d48;
      display:inline-block;
      border-radius:10px;
    ">
      ${otp}
    </div>

    <p style="font-size:12px;color:#888;">
      This OTP expires in 5 minutes
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "🔒 Reset Your Password - PlaceMentor",
    html: baseTemplate(content),
  });
};


// ================= WELCOME MAIL =================
export const sendWelcomeMail = async (email, name) => {
  const content = `
    <h2 style="color:#333;">Welcome ${name} 🎉</h2>
    <p style="color:#555;font-size:15px;">
      We're excited to have you onboard! <br/>
      Start exploring opportunities and grow your skills 🚀
    </p>

    <a href="#" style="
      display:inline-block;
      margin-top:20px;
      padding:12px 24px;
      background:#4f46e5;
      color:#fff;
      text-decoration:none;
      border-radius:8px;
      font-size:14px;
      font-weight:bold;
    ">
      Explore Now
    </a>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "🎉 Welcome to PlaceMentor",
    html: baseTemplate(content),
  });
};

// ================= CONTACT FORM =================
export const sendContactMail = async (name, senderEmail, message) => {
  const content = `
    <h2 style="color:#10b981;">New Contact Message 📧</h2>
    <p style="color:#555;font-size:14px;margin-bottom:20px;">
      You received a new message from the Contact Us form:
    </p>

    <div style="background:#f8fafc;padding:20px;border-radius:12px;border-left:4px solid #10b981;margin:20px 0;">
      <p style="color:#374151;font-weight:600;margin:0 0 8px 0;"><strong>Name:</strong> ${name}</p>
      <p style="color:#374151;font-weight:600;margin:0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color:#4f46e5;">${senderEmail}</a></p>
      <div style="margin-top:15px;">
        <p style="color:#6b7280;font-weight:500;margin:0 0 10px 0;"><strong>Message:</strong></p>
        <p style="color:#374151;line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
      </div>
    </div>

    <p style="color:#6b7280;font-size:13px;">
      Reply directly to ${senderEmail} to respond.
    </p>
  `;

  await transporter.sendMail({
    from: `"PlaceMentor Contact" <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: "New Contact Message from PlaceMentor",
    html: baseTemplate(content),
  });
};

export { transporter };

