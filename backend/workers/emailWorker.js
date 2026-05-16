import { startEmailConsumer } from "../consumers/emailConsumer.js";

const main = async () => {
  await startEmailConsumer();
};

main().catch((e) => {
  console.error("[EMAIL WORKER] fatal", e);
  process.exit(1);
});
