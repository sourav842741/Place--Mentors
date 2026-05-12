import { getProducerChannel } from "../rabbitmq/producerChannel.js";
import { MAX_RETRIES, QUEUES } from "../rabbitmq/queueConstants.js";

const emailJobBase = ({ to, subject, html }) => {
  if (!to || typeof to !== "string") throw new Error("emailProducer: 'to' is required");
  if (!subject || typeof subject !== "string")
    throw new Error("emailProducer: 'subject' is required");
  if (!html || typeof html !== "string") throw new Error("emailProducer: 'html' is required");

  return {
    to,
    subject,
    html,
  };
};

export const assertEmailQueues = async (channel) => {
  // Main queue
  await channel.assertQueue(QUEUES.EMAIL, {
    durable: true,
    arguments: {
      // Keep consumer-side behavior predictable.
    },
  });

  // Retry queue (messages are delayed via x-message-ttl and dead-letter routing)
  await channel.assertQueue(QUEUES.EMAIL_RETRY, {
    durable: true,
    arguments: {
      // When TTL expires, dead-letter to main email queue.
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": QUEUES.EMAIL,
    },
  });

  // DLQ
  await channel.assertQueue(QUEUES.EMAIL_DLQ, {
    durable: true,
  });
};

export const enqueueEmailJob = async ({
  // reserved for future: different queues per email type
  queue = QUEUES.EMAIL,
  to,
  subject,
  html,
  meta = {},
}) => {
  const channel = await getProducerChannel();

  // Ensure topology exists (can be called multiple times safely with assert)
  await assertEmailQueues(channel);

  const payload = {
    ...emailJobBase({ to, subject, html }),
    meta,
    // retry-safe metadata
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    // optional classification for future scalability
    jobType: meta?.jobType || "email",
  };

  const msg = Buffer.from(JSON.stringify(payload));

  channel.sendToQueue(queue, msg, {
    persistent: true,
    contentType: "application/json",
  });

  // Production confirm: wait for broker confirms
  try {
    await channel.waitForConfirms();
  } catch (e) {
    console.error("[RABBITMQ] publish confirm failed", e?.message || e);
    throw e;
  }

  console.log("[RABBITMQ] Enqueued email job", {
    to,
    subject,
    queue,
  });
};
