import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Ticket from "../models/Ticket.model.js";
import AnalyticsEvent from "../models/AnalyticsEvent.model.js";
import { generateTicketId } from "./ticket.controller.js";
import { askAi } from "../services/openRouter.service.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { sendTicketCreatedEmail } from "../services/email/ticketEmail.service.js";

/* =====================================================
   AI SUPPORT PROMPT BUILDER
===================================================== */

const buildSupportPrompt = (conversationHistory, userMessage) => {
  const categories = [
    "Login Issue",
    "Payment",
    "Premium",
    "Bug Report",
    "Resume",
    "Interview",
    "Account",
    "Certificate",
    "Jobs",
    "Performance",
    "Subscription",
    "Feature Request",
    "Other",
  ];

  const systemPrompt = `
You are PlaceMentor Smart Support AI.

You are a premium quality customer support assistant for the PlaceMentor platform.

Your job:
- Understand the user's issue quickly
- Solve problems clearly
- Sound human, smart and professional
- Reduce unnecessary support tickets
- Escalate only when required

==================================================
SUPPORTED LANGUAGES
==================================================

Reply in the same language style as user.

Supported:
- English
- Hinglish
- Hindi
- Bengali
- Punjabi
- Mixed Indian typing style

Examples:
User: login nahi ho raha
Reply: Hinglish

User: premium activate hoyni
Reply: Bengali style

User: payment ho gaya premium nahi mila
Reply: Hinglish

If unsure use simple Hinglish.

==================================================
PLATFORM FEATURES
==================================================

PlaceMentor has:

- AI Interview Practice
- Voice Interview Coach
- Resume Builder
- Coding POTD
- Battle Mode
- Study Planner
- Premium Plans
- Certificates
- Jobs Tools
- Dashboard
- Support Tickets

==================================================
AVAILABLE CATEGORIES
==================================================

${categories.join(", ")}

==================================================
BEHAVIOR RULES
==================================================

1. Be helpful and calm.
2. Solve first.
3. Ask minimum questions.
4. Keep replies short and useful.
5. Sound natural.
6. Never sound robotic.
7. Keep trust.

==================================================
COMMON ISSUES TO SOLVE
==================================================

- Login failed
- OTP not received
- Password reset
- Premium not activated
- Payment done but no access
- Resume not downloading
- AI interview not loading
- Mic permission issue
- Certificate missing
- Website slow
- Bug report
- Dashboard issue
- Planner issue
- Battle issue
- Account issue
- Subscription issue

==================================================
SOLUTION STYLE
==================================================

Give practical solutions like:

1. Logout and login again
2. Refresh dashboard
3. Clear browser cache
4. Try Chrome browser
5. Wait 2 minutes for sync
6. Check internet
7. Allow microphone permission

==================================================
SECURITY RULES
==================================================

Never ask for:
- Password
- OTP
- Card PIN
- Bank details

==================================================
PAYMENT RULES
==================================================

Never claim:
- Refund completed
- Premium activated manually
- Payment reversed

Instead say:
Please share payment ID or screenshot. Support team can verify.

==================================================
STRICT RESPONSE FORMAT
==================================================

Return plain text only.

Do NOT use:
*
**
#
-
markdown
tables
code blocks

Use only this format:

Issue: short issue name

Solution:
1. Step one
2. Step two
3. Step three

Need more help?

==================================================
ESCALATION RULES
==================================================

Add [ESCALATE] only if:

- User says still not solved
- Refund request
- Payment issue repeated
- Account suspended
- Serious bug
- User asks human support
- Technical issue not solvable
- Missing certificate after completion
- You are unsure

==================================================
RESOLVED RULES
==================================================

Add [RESOLVED] only if:

- User says solved
- Thanks worked
- Fixed now
- Working now

==================================================
CONTINUE RULE
==================================================

Otherwise add:

[CONTINUE]

==================================================
IMPORTANT
==================================================

Never use stars.
Never use markdown.
Never use bullet symbols.
Never use bold text.

Always sound premium and human.
`;

  const messages = [{ role: "system", content: systemPrompt }];

  if (conversationHistory && Array.isArray(conversationHistory)) {
    conversationHistory.slice(-12).forEach((msg) => {
      if (msg.role === "user") {
        messages.push({
          role: "user",
          content: msg.text,
        });
      } else if (msg.role === "ai") {
        const clean = msg.text
          .replace(/\[ESCALATE\]/g, "")
          .replace(/\[RESOLVED\]/g, "")
          .replace(/\[CONTINUE\]/g, "")
          .trim();

        messages.push({
          role: "assistant",
          content: clean,
        });
      }
    });
  }

  messages.push({
    role: "user",
    content: userMessage,
  });

  return messages;
};

const parseAiResponse = (text) => {
  const shouldEscalate = text.includes("[ESCALATE]");
  const isResolved = text.includes("[RESOLVED]");
  const cleanedText = text
    .replace(/\[ESCALATE\]/g, "")
    .replace(/\[RESOLVED\]/g, "")
    .replace(/\[CONTINUE\]/g, "")
    .trim();

  return {
    response: cleanedText,
    shouldEscalate,
    isResolved,
  };
};

/* =====================================================
   AI CHAT
===================================================== */

export const chatWithSupportAI = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  const userId = req.user._id;

  if (!message?.trim()) {
    throw new ApiError(400, "Message is required");
  }

  // Track analytics: ai_chat_started on first message
  if (!history || history.length === 0) {
    AnalyticsEvent.create({
      eventType: "ai_chat_started",
      userId,
      metadata: { firstMessage: message.trim().substring(0, 100) },
    }).catch(() => {});
  }

  const messages = buildSupportPrompt(history, message.trim());
  const aiRawResponse = await askAi(messages);

  if (!aiRawResponse) {
    throw new ApiError(500, "AI service unavailable. Please try again or create a ticket.");
  }

  const parsed = parseAiResponse(aiRawResponse);

  // Track resolved
  if (parsed.isResolved) {
    AnalyticsEvent.create({
      eventType: "ai_resolved",
      userId,
      metadata: { messageCount: (history?.length || 0) + 1 },
    }).catch(() => {});
  }

  // Track escalation intent
  if (parsed.shouldEscalate) {
    AnalyticsEvent.create({
      eventType: "ai_escalated",
      userId,
      metadata: { messageCount: (history?.length || 0) + 1 },
    }).catch(() => {});
  }

  res.status(200).json(
    new ApiResponse(200, {
      response: parsed.response,
      shouldEscalate: parsed.shouldEscalate,
      isResolved: parsed.isResolved,
    }, "AI response generated")
  );
});

/* =====================================================
   ESCALATE TO TICKET
===================================================== */

export const escalateToTicket = asyncHandler(async (req, res) => {
  const {
    subject,
    category,
    priority,
    description,
    email,
    mobile,
    aiChatSummary,
  } = req.body;

  const userId = req.user._id;

  if (!subject?.trim()) throw new ApiError(400, "Subject is required");
  if (!category) throw new ApiError(400, "Category is required");

  const validCategories = [
    "Login Issue",
    "Payment",
    "Premium",
    "Bug Report",
    "Resume",
    "Interview",
    "Account",
    "Other",
  ];
  if (!validCategories.includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  const validPriorities = ["Low", "Medium", "High"];
  const ticketPriority = validPriorities.includes(priority) ? priority : "Low";

  let imageUrl = "";
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (uploaded?.secure_url) {
      imageUrl = uploaded.secure_url;
    }
  }

  const ticketId = await generateTicketId();

  // Build rich description with AI conversation summary
  const baseDescription = description?.trim() || "";
  const summary = aiChatSummary?.trim() || "";

  const enrichedDescription = summary
    ? `📝 Issue Summary:\n${baseDescription}\n\n🤖 AI Conversation Summary:\n${summary}`
    : baseDescription;

  const ticket = await Ticket.create({
    ticketId,
    user: userId,
    subject: subject.trim(),
    category,
    priority: ticketPriority,
    description: enrichedDescription,
    email: email?.trim() || req.user.email,
    mobile: mobile?.trim() || "",
    image: imageUrl,
    aiEscalated: true,
    aiChatSummary: summary,
  });

  const populatedTicket = await Ticket.findById(ticket._id)
    .populate("user", "fullName email avatar")
    .lean();

  // Send confirmation email to user (existing logic reused)
  try {
    await sendTicketCreatedEmail(populatedTicket.email, {
      ...populatedTicket,
      userName: populatedTicket.user?.fullName,
    });
  } catch (emailErr) {
    console.error("[ESCALATE] Ticket created email failed:", emailErr.message);
  }

  // Notify admins via socket (existing logic reused)
  if (req.io) {
    req.io.to("admins").emit("ticket:updated", {
      ticketId: ticket._id,
      action: "created",
      ticket: populatedTicket,
    });
  }

  // Track analytics
  AnalyticsEvent.create({
    eventType: "ai_escalated",
    userId,
    metadata: { ticketId, category, source: "escalation_endpoint" },
  }).catch(() => {});

  res.status(201).json(
    new ApiResponse(201, populatedTicket, "Ticket created from AI escalation")
  );
});

