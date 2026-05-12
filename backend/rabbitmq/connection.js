import amqplib from "amqplib";

let _connection = null;
let _creating = null;

const createConnection = async () => {
  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error("Missing RABBITMQ_URL env var");
  }

  _connection = await amqplib.connect(url, {
    heartbeat: 30,
    clientProperties: {
      applicationName: "preparation-buddy-backend",
    },
  });

  // Shared error logging
  _connection.on("error", (err) => {
    console.error("[RABBITMQ] connection error", err);
  });

  _connection.on("close", () => {
    console.warn("[RABBITMQ] connection closed");
    _connection = null;
  });

  return _connection;
};

export const getConnection = async () => {
  if (_connection) return _connection;
  if (_creating) return _creating;

  _creating = createConnection().finally(() => {
    _creating = null;
  });

  return _creating;
};

// Reusable helper: create a channel from the singleton connection
export const createChannel = async () => {
  const conn = await getConnection();
  const channel = await conn.createChannel();

  // Confirm mode helps ensure messages are actually published to the broker.
  // Not strictly required for at-most-once semantics, but good for reliability.
  try {
    await channel.confirmSelect();
  } catch {
    // ignore if broker doesn't support
  }

  return channel;
};

export const closeConnection = async () => {
  if (_connection) {
    try {
      await _connection.close();
    } catch (e) {
      console.warn("[RABBITMQ] closeConnection error", e?.message || e);
    }
  }
  _connection = null;
};
