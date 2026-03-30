import jwt from "jsonwebtoken";

const genToken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );
  } catch (error) {
    throw new Error(`gen token error: ${error.message}`);
  }
};

export default genToken;