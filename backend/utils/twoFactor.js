import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

export const privilegedRoles = ["admin", "superadmin"];

export const isPrivilegedRole = (role) => privilegedRoles.includes(role);

export const generateSecret = (
  email = "admin@placementmentor.com",
  role = "admin"
) => {
  const safeRole =
    role === "superadmin"
      ? "Super Admin"
      : "Admin";

  return speakeasy.generateSecret({
    issuer: "Place Mentor",
    name: `${safeRole} - ${email}`,
    length: 32,
  });
};

export const generateQRCode = async (otpAuthUrl) => {
  return QRCode.toDataURL(otpAuthUrl);
};

export const verifyTOTP = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // allow 1 step before/after for clock drift
  });
};

export const generateRecoveryCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const bytes = crypto.randomBytes(4);
    const code = bytes.toString("hex").toUpperCase();
    codes.push(code);
  }
  return codes;
};

export const hashRecoveryCodes = (codes) => {
  return codes.map((code) =>
    crypto.createHash("sha256").update(code).digest("hex")
  );
};

export const verifyRecoveryCode = (inputCode, hashedCodes) => {
  const inputHash = crypto
    .createHash("sha256")
    .update(inputCode.toUpperCase().trim())
    .digest("hex");
  return hashedCodes.findIndex((hash) => hash === inputHash);
};

export const generateDeviceId = () => {
  return crypto.randomBytes(32).toString("hex");
};

