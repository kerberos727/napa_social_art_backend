/* eslint-disable @typescript-eslint/no-var-requires */
import { socialArtDB } from "../index";
import PostedVideos from "../models/posted-videos.model";
const cron = require("node-cron");
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

// */30 * * * * * every 30 seconds

cron.schedule("59 23 * * 6", async () => {
  try {
    console.log("Update Post Views Cron Pending");
    const [posts]: any = await PostedVideos.getAllPostsViews();

//     const tableQuery =
//     "CREATE TABLE IF NOT EXISTS views (rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY, viewsUUID VARCHAR(45) PRIMARY KEY NOT NULL, postId VARCHAR(45), prev_7_days_views INT DEFAULT 0, prev_7_days_views_date TEXT, prev_14_days_views INT DEFAULT 0, prev_14_days_views_date TEXT, prev_21_days_views INT DEFAULT 0, prev_21_days_views_date TEXT, prev_28_days_views INT DEFAULT 0, prev_28_days_views_date TEXT, prev_35_days_views INT DEFAULT 0, prev_35_days_views_date TEXT, prev_42_days_views INT DEFAULT 0, prev_42_days_views_date TEXT, prev_allTime_views INT DEFAULT 0, prev_allTime_views_date TEXT, weekCount INT DEFAULT 1, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)";

//   await socialArtDB.query(tableQuery);
    

if(posts?.length > 0)
{
    await Promise.all(
        posts?.map(async (post: any) => {
          const getViews = `SELECT * FROM views WHERE postId = "${post.postId}"`;
          const [views]: any = await socialArtDB.query(getViews);
          if (!views.length) {
            const uuid = uuidv4();
            const insertQuery = `INSERT INTO views (viewsUUID, postId, prev_7_days_views, prev_7_days_views_date, prev_14_days_views, prev_14_days_views_date, prev_21_days_views, prev_21_days_views_date, prev_28_days_views, prev_28_days_views_date, prev_35_days_views, prev_35_days_views_date, prev_42_days_views, prev_42_days_views_date, prev_allTime_views, prev_allTime_views_date, weekCount, createdAt, updatedAt) VALUES (
              "${uuid}",
              "${post.postId || ""}",
              "${post.views}",
              "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
              0,
              "",
              0,
              "",
              0,
              "",
              0,
              "",
              0,
              "",
              0,
              "",
              1,
              "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
              "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
              )`;
            await socialArtDB.query(insertQuery);
          }
          else {            
              if(views[0].weekCount == 1)
              {
                  const updateQuery = `UPDATE views SET prev_7_days_views = "${post.views - views[0].prev_7_days_views}", prev_7_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_14_days_views = "${post.views}", prev_14_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_allTime_views = "${post.views}", prev_allTime_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", weekCount = 2, updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${post.postId}"`;
                  await socialArtDB.query(updateQuery);
                  return   
              }
              if(views[0].weekCount == 2)
              {
                  const updateQuery = `UPDATE views SET prev_7_days_views = "${post.views - views[0].prev_7_days_views}", prev_7_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_21_days_views = "${post.views}", prev_21_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_allTime_views = "${post.views}", prev_allTime_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", weekCount = 3, updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${post.postId}"`;
                  await socialArtDB.query(updateQuery);
                  return   
              }
              if(views[0].weekCount == 3)
              {
                  const updateQuery = `UPDATE views SET prev_7_days_views = "${post.views - views[0].prev_7_days_views}", prev_7_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_28_days_views = "${post.views}", prev_28_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_allTime_views = "${post.views}", prev_allTime_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", weekCount = 4, updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${post.postId}"`;
                  await socialArtDB.query(updateQuery);  
                  return 
              }
              if(views[0].weekCount == 4)
              {
                  const updateQuery = `UPDATE views SET prev_7_days_views = "${post.views - views[0].prev_7_days_views}", prev_7_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_35_days_views = "${post.views}", prev_35_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_allTime_views = "${post.views}", prev_allTime_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", weekCount = 5, updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${post.postId}"`;
                  await socialArtDB.query(updateQuery); 
                  return  
              }
              if(views[0].weekCount == 5)
              {
                  const updateQuery = `UPDATE views SET prev_7_days_views = "${post.views - views[0].prev_7_days_views}", prev_7_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_42_days_views = "${post.views}", prev_42_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_allTime_views = "${post.views}", prev_allTime_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", weekCount = 6, updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${post.postId}"`;
                  await socialArtDB.query(updateQuery);   
                  return
              }
              const updateQuery = `UPDATE views SET prev_7_days_views = "${post.views - views[0].prev_7_days_views}", prev_7_days_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", prev_allTime_views = "${post.views}", prev_allTime_views_date = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}", weekCount = "${views[0].weekCount + 1}", updatedAt = "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}" WHERE postId = "${post.postId}"`;
              await socialArtDB.query(updateQuery);  
          }
        })
      );
}

  } catch (error) {
    console.log(error);
    console.log("Update Post Views Cron Rejected");
    throw new Error(error);
  }
}, {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  });
