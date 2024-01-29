/* eslint-disable @typescript-eslint/no-var-requires */
const cron = require("node-cron");

cron.schedule("*/03 * * * * *", async () => {
  try {
    console.log("Napa token price cron job pending");
    global.SocketService.handleGetNapaTokenPrice({
      price: (Math.random() * (5 - 4) + 4).toFixed(8),
    });
    console.log("Napa token price cron job fullfilled");
  } catch (error) {
    console.error(error);
    console.log("Napa token price cron job rejected");
    throw new Error(error);
  }
});
