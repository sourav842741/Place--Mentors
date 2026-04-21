import axios from "axios";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const API_KEY = process.env.VIDEOSDK_API_KEY;
const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;
const GATEWAY_ID =
  process.env.VIDEOSDK_GATEWAY_ID || process.env.GATEWAY_ID;

if (!API_KEY || !SECRET_KEY || !GATEWAY_ID) {
  throw new ApiError(
    500,
    "VideoSDK environment variables missing"
  );
}

// Generate secure VideoSDK JWT token
const generateVideoSDKToken = () => {
  return jwt.sign(
    {
      apikey: API_KEY,
      permissions: [
        "allow_join",
        "allow_mod"
      ]
    },
    SECRET_KEY,
    {
      algorithm: "HS256",
      expiresIn: "1h"
    }
  );
};

// Start AI Phone Call
const startAICall = async (phone) => {
  try {
    const token = generateVideoSDKToken();

    const response = await axios.post(
      "https://api.videosdk.live/v2/sip/call",
      {
        gatewayId: GATEWAY_ID,
        sipCallTo: phone
      },
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "VideoSDK Call Error:",
      error.response?.data || error.message
    );

    throw new ApiError(
      500,
      "Failed to start AI call"
    );
  }
};

export default startAICall;