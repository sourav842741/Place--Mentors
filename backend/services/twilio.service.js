import twilio from "twilio";
import { ApiError } from "../utils/ApiError.js";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhone) {
  throw new ApiError(500, "Twilio env vars missing");
}

const client = twilio(accountSid, authToken);

export const createVoiceCall = async (toPhone, url) => {
  try {
    const call = await client.calls.create({
      url, // TwiML URL (webhook)
      to: toPhone,
      from: twilioPhone,
      statusCallback: `${process.env.BASE_URL}/api/voice/webhook`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      timeout: 60,
      record: true,
    });

    return call.sid;
  } catch (error) {
    console.error("Twilio call error:", error);
    throw new ApiError(500, "Failed to initiate call");
  }
};

export const getCallStatus = async (callSid) => {
  try {
    const call = await client.calls(callSid).fetch();
    return call.status;
  } catch (error) {
    throw new ApiError(500, "Failed to fetch call status");
  }
};

export default { createVoiceCall, getCallStatus };
