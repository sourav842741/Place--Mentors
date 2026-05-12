import { getConnection } from "./connection.js";

let _channel = null;
let _creating = null;

export const getProducerChannel = async () => {
  if (_channel) return _channel;
  if (_creating) return _creating;

  _creating = (async () => {
    const conn = await getConnection();

    // Dedicated confirm channel for production reliability
    // Use createConfirmChannel + waitForConfirms (amqplib best practice)
    const channel = await conn.createConfirmChannel();

    _channel = channel;

    return _channel;
  })().finally(() => {
    _creating = null;
  });

  return _creating;
};

export const closeProducerChannel = async () => {
  if (!_channel) return;
  try {
    await _channel.close();
  } catch {
    // ignore
  }
  _channel = null;
};
