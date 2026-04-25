// ================= AUTH VALIDATORS & HELPERS =================
// Pure functions extracted from auth.controllers.js for testability

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => !!(password && password.length >= 6);

export const validateSkills = (skills) =>
  Array.isArray(skills) &&
  skills.length > 0 &&
  skills.every((skill) => skill && skill.trim().length > 0);

export const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.twoFactorTempSecret;
  delete obj.twoFactorRecoveryCodes;
  delete obj.trustedDevices;
  return obj;
};

