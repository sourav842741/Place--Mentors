import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

/* =========================================
   RESEND CONFIG
========================================= */

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const EMAIL_AUTH =
  process.env.EMAIL_AUTH ||
  "PlaceMentor Security <security@placementor.online>";

/* =========================================
   COMMON SEND FUNCTION
========================================= */

const sendResendMail = async (
  to,
  subject,
  html
) => {
  return await resend.emails.send({
    from: EMAIL_AUTH,
    to: [to],
    subject,
    html,
  });
};

/* =========================================
   BASE TEMPLATE
========================================= */

const baseTemplate = (
  content
) => `
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

<tr>
<td style="background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:25px;text-align:center;color:#fff;">
<h1 style="margin:0;font-size:22px;">PlaceMentor 🚀</h1>
<p style="margin:5px 0 0;font-size:13px;">Grow your career smarter</p>
</td>
</tr>

<tr>
<td style="padding:30px;text-align:center;">
${content}
</td>
</tr>

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

/* =========================================
   SIGNUP OTP
========================================= */

export const sendSignupOtpMail =
  async (email, otp) => {
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

    await sendResendMail(
      email,
      "🎉 Verify Your Email - PlaceMentor",
      baseTemplate(content)
    );
  };

/* =========================================
   RESET OTP
========================================= */

export const sendResetOtpMail =
  async (email, otp) => {
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

    await sendResendMail(
      email,
      "🔒 Reset Your Password - PlaceMentor",
      baseTemplate(content)
    );
  };

/* =========================================
   WELCOME MAIL
========================================= */

export const sendWelcomeMail =
  async (email, name) => {
    const content = `
<h2 style="color:#333;">Welcome ${name} 🎉</h2>

<p style="color:#555;font-size:15px;">
We're excited to have you onboard! <br/>
Start exploring opportunities and grow your skills 🚀
</p>

<a href="https://placementor.online/dashboard"
style="
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

    await sendResendMail(
      email,
      "🎉 Welcome to PlaceMentor",
      baseTemplate(content)
    );
  };

  export const sendContactMail = async (
  name,
  senderEmail,
  message
) => {
  const content = `
<h2 style="color:#10b981;">New Contact Message 📩</h2>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${senderEmail}</p>

<p><strong>Message:</strong></p>

<div style="
padding:15px;
background:#f3f4f6;
border-radius:10px;
white-space:pre-wrap;
text-align:left;
">
${message}
</div>
`;

  await resend.emails.send({
    from:
      process.env.EMAIL_AUTH ||
      "PlaceMentor Security <security@placementor.online>",

    to: ["souravkumar85055@gmail.com"],

    subject: "New Contact Form Message",

    reply_to: senderEmail,

    html: baseTemplate(content),
  });
};