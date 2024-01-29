/* eslint-disable @typescript-eslint/no-var-requires */
import PostedVideos from "../models/posted-videos.model";
import { napaDB, socialArtDB } from "../index";
const cron = require("node-cron");

cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Monthly user count cron job pending");
    const [monthlyPosts] = await PostedVideos.getMonthlyPosts();
    const monthlyCount = [];

    const monthlyUsers = [];
    // @ts-ignore
    monthlyPosts.forEach((user) => {
      if (!monthlyUsers.map((u) => u.profileId).includes(user.profileId)) {
        monthlyUsers.push({ profileId: user.profileId, posts: [] });
      }
    });

    const NewMonthlyUsers = monthlyUsers.map((u) => {
      return {
        ...u,
        // @ts-ignore
        posts: monthlyPosts.filter((p) => p.profileId == u.profileId),
      };
    });

    NewMonthlyUsers.forEach((u) => {
      if (u.posts.length >= 8) {
        monthlyCount.push(u.profileId);
      }
    });

    const profileIds = JSON.stringify(monthlyCount)
      .replace("[", "(")
      .replace("]", ")");

    const updateMonthlyActiveQeury = `UPDATE users SET monthlyActive = "true" WHERE profileId IN ${profileIds}`;
    await socialArtDB.query(updateMonthlyActiveQeury);
    await napaDB.query(updateMonthlyActiveQeury);

    const removeOldMonthlyActiveQeury = `UPDATE users SET monthlyActive = "false" WHERE profileId NOT IN ${profileIds}`;
    await socialArtDB.query(removeOldMonthlyActiveQeury);
    await napaDB.query(removeOldMonthlyActiveQeury);
    console.log("Monthly user count cron job fullfilled");
  } catch (error) {
    console.error(error);
    console.log("Monthly user count cron job rejected");
    throw new Error(error);
  }
});
