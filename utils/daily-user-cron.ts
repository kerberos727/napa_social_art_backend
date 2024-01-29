/* eslint-disable @typescript-eslint/no-var-requires */
import PostedVideos from "../models/posted-videos.model";
import { napaDB, socialArtDB } from "../index";
const cron = require("node-cron");

cron.schedule("0 0 * * 6", async () => {
  try {
    console.log("Daily user count cron job pending");
    const [weeklyPosts] = await PostedVideos.getWeeklyPosts();
    const weeklyCount = [];

    const weeklyUsers = [];
    // @ts-ignore
    weeklyPosts.forEach((user) => {
      if (!weeklyUsers.map((u) => u.profileId).includes(user.profileId)) {
        weeklyUsers.push({ profileId: user.profileId, posts: [] });
      }
    });

    const NewWeeklyUsers = weeklyUsers.map((u) => {
      return {
        ...u,
        // @ts-ignore
        posts: weeklyPosts.filter((p) => p.profileId == u.profileId),
      };
    });

    NewWeeklyUsers.forEach((u) => {
      if (u.posts.length >= 4) {
        weeklyCount.push(u.profileId);
      }
    });

    const profileIds = JSON.stringify(weeklyCount)
      .replace("[", "(")
      .replace("]", ")");

    const updateDailyActiveQeury = `UPDATE users SET dailyActive = "true" WHERE profileId IN ${profileIds}`;
    await socialArtDB.query(updateDailyActiveQeury);
    await napaDB.query(updateDailyActiveQeury);

    const removeOldDailyActiveQeury = `UPDATE users SET dailyActive = "false" WHERE profileId NOT IN ${profileIds}`;
    await socialArtDB.query(removeOldDailyActiveQeury);
    await napaDB.query(removeOldDailyActiveQeury);
    console.log("Daily user count cron job fullfilled");
  } catch (error) {
    console.error(error);
    console.log("Daily user count cron job rejected");
    throw new Error(error);
  }
});
