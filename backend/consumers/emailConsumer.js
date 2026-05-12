import { createChannel, closeConnection } from "../rabbitmq/connection.js";
import { MAX_RETRIES, QUEUES } from "../rabbitmq/queueConstants.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

import { getEmailTemplate } from "../services/email/templates.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "PlaceMentor <noreply@placementor.online>";

if (!RESEND_API_KEY) {
  console.warn("[EMAIL CONSUMER] RESEND_API_KEY missing. Consumer will fail on send.");
}

const resend = new Resend(RESEND_API_KEY);

const delayMsForAttempt = (attempt) => {
  // attempt: 1..max
  if (attempt <= 1) return 5_000;
  if (attempt === 2) return 20_000;
  return 60_000;
};

const sleepSafe = (ms) => new Promise((r) => setTimeout(r, ms));

const ensureTopology = async (channel) => {
  await channel.assertQueue(QUEUES.EMAIL, { durable: true });

  await channel.assertQueue(QUEUES.EMAIL_RETRY, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": QUEUES.EMAIL,
    },
  });

  await channel.assertQueue(QUEUES.EMAIL_DLQ, { durable: true });
};

const publishToRetry = async (channel, payload) => {
  const retryCount = payload.retryCount ?? 0;
  const maxRetries = payload.maxRetries ?? MAX_RETRIES;

  // attempt number after increment
  const nextRetry = retryCount + 1;

  if (nextRetry > maxRetries) {
    // Max retries exceeded -> DLQ
    await channel.sendToQueue(QUEUES.EMAIL_DLQ, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: "application/json",
    });

    console.error("[EMAIL CONSUMER] moved to DLQ", {
      to: payload.to,
      subject: payload.subject,
      retryCount,
      maxRetries,
    });
    return;
  }

  const delayMs = delayMsForAttempt(nextRetry);
  const retryPayload = {
    ...payload,
    retryCount: nextRetry,
  };

  await channel.sendToQueue(QUEUES.EMAIL_RETRY, Buffer.from(JSON.stringify(retryPayload)), {
    persistent: true,
    contentType: "application/json",
    // TTL delay (will dead-letter to main queue)
    expiration: String(delayMs),
  });

  console.warn("[EMAIL CONSUMER] scheduled retry", {
    to: payload.to,
    subject: payload.subject,
    retryCount: nextRetry,
    delayMs,
  });
};

const sendEmailViaResend = async ({ to, subject, html }) => {
  const response = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
  });

  return response;
};

let consumerTag = null;
let channelRef = null;
let shuttingDown = false;

export const startEmailConsumer = async () => {
  const channel = await createChannel();
  channelRef = channel;

  await ensureTopology(channel);

  // Prefetch to process one message at a time (better for rate limiting)
  await channel.prefetch(1);

  console.log("[EMAIL CONSUMER] waiting for messages on", QUEUES.EMAIL);

  const { consumerTag: tag } = await channel.consume(
    QUEUES.EMAIL,
    async (msg) => {
      if (!msg) return;
      if (shuttingDown) return;

      const raw = msg.content?.toString?.() || "";

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        console.error("[EMAIL CONSUMER] invalid JSON payload -> ack to avoid poison pill", {
          raw,
          error: e?.message,
        });
        channel.ack(msg);
        return;
      }

      const { to, subject, html } = payload;

      try {
        // Defensive validation
        if (!to || !subject || !html) {
          throw new Error("Missing required payload fields: to, subject, html");
        }

        // Send the email
        await sendEmailViaResend({ to, subject, html });

        // ACK only after successful send
        channel.ack(msg);
        console.log("[EMAIL CONSUMER] sent email", { to, subject });
      } catch (error) {
        console.error("[EMAIL CONSUMER] send failed", {
          to,
          subject,
          attempt: (payload.retryCount ?? 0) + 1,
          error: error?.message || error,
        });

        try {
          // Retry-safe handling
          await publishToRetry(channel, payload);
        } catch (pubErr) {
          console.error("[EMAIL CONSUMER] failed to publish retry/DLQ", pubErr);

          // If retry publishing fails, nack with requeue=false to prevent infinite loops.
          // The message will be lost; production systems may want an out-of-band persistence.
          channel.nack(msg, false, false);
          return;
        }

        // ACK original message after we moved it to retry/DLQ
        channel.ack(msg);

        // tiny delay to reduce hot loops during failures
        await sleepSafe(50);
      }
    },
    {
      noAck: false,
    }
  );

  consumerTag = tag;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log("[EMAIL CONSUMER] shutting down...");
    try {
      if (channelRef && consumerTag) {
        await channelRef.cancel(consumerTag);
      }
    } catch {
      // ignore
    }

    try {
      if (channelRef) {
        await channelRef.close();
      }
    } catch {
      // ignore
    }

    await closeConnection();
    console.log("[EMAIL CONSUMER] shutdown complete");
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
};

// If executed directly: node backend/consumers/emailConsumer.js
if (import.meta.url === `file://${process.argv[1]}`) {
  startEmailConsumer().catch((e) => {
    console.error("[EMAIL CONSUMER] fatal", e);
    process.exit(1);
  });
}
