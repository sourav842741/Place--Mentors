import jwt from "jsonwebtoken";

const genToken = (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10d" });
  } catch (error) {
    throw new Error(`gen token error: ${error.message}`);
  }
};

export const genTempToken = (userId) => {
  try {
    return jwt.sign({ userId, type: "2fa_temp" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  } catch (error) {
    throw new Error(`gen temp token error: ${error.message}`);
  }
};

export const verifyTempToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired temp token");
  }
};

export default genToken;
