//BASE EMAIL TEMPLATE

export const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>PlaceMentor</title>
</head>

<body style="
margin:0;
padding:0;
background:#f4f6f9;
font-family:Segoe UI,Arial,sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="padding:20px 10px;"
>

<tr>
<td align="center">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
background:#ffffff;
border-radius:16px;
overflow:hidden;
box-shadow:0 10px 25px rgba(0,0,0,0.1);
"
>

<!-- HEADER -->
<tr>
<td
style="
background:linear-gradient(135deg,#4f46e5,#06b6d4);
padding:25px;
text-align:center;
color:#fff;
"
>
<h1 style="margin:0;font-size:22px;">
PlaceMentor 🚀
</h1>

<p style="margin:5px 0 0;font-size:13px;">
Grow your career smarter
</p>
</td>
</tr>

<!-- BODY -->
<tr>
<td
style="
padding:30px;
text-align:center;
"
>
${content}
</td>
</tr>

<!-- FOOTER -->
<tr>
<td
style="
padding:20px;
text-align:center;
font-size:12px;
color:#999;
background:#fafafa;
"
>
© ${new Date().getFullYear()} PlaceMentor
<br/>
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
   SIGNUP OTP TEMPLATE
========================================= */

export const buildSignupOtpTemplate = (otp) => {
  const subject = "🎉 Verify Your Email - PlaceMentor";

  const content = `
<h2 style="margin:0;color:#333;">
Verify Your Email 🎉
</h2>

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

  return {
    subject,
    html: baseTemplate(content),
  };
};

/* =========================================
   RESET OTP TEMPLATE
========================================= */

export const buildResetOtpTemplate = (otp) => {
  const subject = "🔒 Reset Your Password - PlaceMentor";

  const content = `
<h2 style="color:#e11d48;">
Reset Password 🔒
</h2>

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

  return {
    subject,
    html: baseTemplate(content),
  };
};

/* =========================================
   WELCOME TEMPLATE
========================================= */

export const buildWelcomeTemplate = (name) => {
  const subject = "🎉 Welcome to PlaceMentor";

  const content = `
<h2 style="color:#333;">
Welcome ${name} 🎉
</h2>

<p style="color:#555;font-size:15px;">
We're excited to have you onboard!
<br/>
Start exploring opportunities and grow your skills 🚀
</p>

<a
href="https://placementor.online/dashboard"

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
"
>
Explore Now
</a>
`;

  return {
    subject,
    html: baseTemplate(content),
  };
};

/* =========================================
   NEW LOGIN ALERT TEMPLATE
========================================= */

export const buildNewLoginTemplate = ({
  userName,
  browser,
  os,
  deviceName,
  ipAddress,
  loginTime,
  location,
  platformName,
  loginMethod,
}) => {
  const subject = "New Login Detected on Your Placementor Account";

  const safeBrowser = browser || "Unknown";
  const safeOs = os || "Unknown";
  const safeDeviceName = deviceName || "Unknown";
  const safeIp = ipAddress || "—";
  const safeLoginTime = loginTime ? new Date(loginTime).toLocaleString(undefined) : "—";
  const safeLocation = location ? location : "Location not available";
  const safePlatform = platformName || "Placementor";
  const safeLoginMethod = loginMethod === "google" ? "Google" : "Email";

  const content = `
  <h2 style="margin:0;color:#111827;">
    New Login Detected 🚨
  </h2>

  <p style="color:#374151;font-size:14px;">
    Hello ${userName || ""},
  </p>

  <p style="color:#374151;font-size:14px;">
    A new login was detected on your <strong>${safePlatform}</strong> account.
  </p>

  <div style="text-align:left;margin:18px auto 0;max-width:480px;">
    <p style="margin:0 0 8px;color:#111827;font-weight:600;font-size:13px;">Device Information</p>

    <ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:1.6;">
      <li><strong>Browser:</strong> ${safeBrowser}</li>
      <li><strong>Operating System:</strong> ${safeOs}</li>
      <li><strong>Device:</strong> ${safeDeviceName}</li>
      <li><strong>IP Address:</strong> ${safeIp}</li>
      <li><strong>Login Time:</strong> ${safeLoginTime}</li>
      <li><strong>Login Method:</strong> ${safeLoginMethod}</li>
      <li><strong>Location:</strong> ${safeLocation}</li>
    </ul>
  </div>

  <p style="color:#374151;font-size:14px;margin-top:16px;">
    If this was you, no action is required.
  </p>

  <p style="color:#e11d48;font-weight:600;font-size:14px; margin-top:10px;">
    If you do not recognize this activity:
  </p>

  <ol style="margin:8px 0 0;padding-left:18px;color:#374151;font-size:13px;line-height:1.6;">
    <li>Change your password immediately.</li>
    <li>Review Active Sessions.</li>
    <li>Logout all other devices.</li>
  </ol>

  <p style="color:#6b7280;font-size:12px; margin-top:18px;">
    Security Team<br/>
    ${safePlatform}
  </p>
  `;

  return {
    subject,
    html: baseTemplate(content),
  };
};

/* =========================================
   CONTACT TEMPLATE
========================================= */

export const buildContactTemplate = ({ name, senderEmail, message }) => {
  const subject = "📩 New Contact Form Message";

  const content = `
<h2 style="color:#10b981;">
New Contact Message 📩
</h2>

<p>
<strong>Name:</strong>
${name}
</p>

<p>
<strong>Email:</strong>
${senderEmail}
</p>

<p>
<strong>Message:</strong>
</p>

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

  return {
    subject,
    html: baseTemplate(content),
  };
};
