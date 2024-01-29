/* eslint-disable @typescript-eslint/no-var-requires */
import PostedVideos from "../models/posted-videos.model";
import { removeDuplicates } from "./removeDuplicates";
const cron = require("node-cron");

// */30 * * * * * every 30 seconds

cron.schedule("*/10 * * * *", async () => {
  try {
    console.log("Get Most Viewed Posts Cron Pending");
    const [posts] = await PostedVideos.getMostViewedPosts();

    const uniqueArray = removeDuplicates(posts, (a, b) => a?.postId === b?.postId);

    console.log("Get Most Viewed Posts Cron Successfully");
    const likedPosts = [];
    const discussedPosts = [];
    const awardedPosts = [];
    // @ts-ignore
    uniqueArray.forEach((post) => {
      const likedByUsers = post.likedByUsers
        ? post.likedByUsers.split(",")
        : [];
      likedPosts.push({
        postId: post.postId,
        likes: likedByUsers.length,
        userName: post.profileName,
        avatar: post.avatar,
        mintId: post.mintId,
        thumbnail: post.thumbnail,
      });
    });

    const mostLikedPosts = [...likedPosts];
    mostLikedPosts.sort((a, b) => b.likes - a.likes);

    const filteredLikedPosts = mostLikedPosts.filter((p) => p.likes > 0);

    // @ts-ignore
    uniqueArray.forEach((post) => {
      const commentByUser = post.commentByUser
        ? post.commentByUser.split(",")
        : [];
      discussedPosts.push({
        postId: post.postId,
        comments: commentByUser.length,
        userName: post.profileName,
        avatar: post.avatar,
        mintId: post.mintId,
        thumbnail: post.thumbnail,
      });
    });

    const mostCommentedPosts = [...discussedPosts];
    mostCommentedPosts.sort((a, b) => b.comments - a.comments);

    const filteredDiscussedPostsPosts = mostCommentedPosts.filter(
      (p) => p.comments > 0
    );

    // @ts-ignore
    uniqueArray.forEach((post) => {
      const awardsByUsers = post.awardsByUsers
        ? post.awardsByUsers.split(",")
        : [];
      awardedPosts.push({
        postId: post.postId,
        awards: awardsByUsers.length,
        userName: post.profileName,
        avatar: post.avatar,
        mintId: post.mintId,
        thumbnail: post.thumbnail,
      });
    });

    const mostAwardedPosts = [...awardedPosts];
    mostAwardedPosts.sort((a, b) => b.awards - a.awards);

    const filteredAwardedPosts = mostAwardedPosts.filter((p) => p.awards > 0);

    global.SocketService.handleGetMostLikedPosts({
      event: "most-liked-posts",
      posts:
        // @ts-ignore
        filteredLikedPosts.length
          ? filteredLikedPosts.length > 10
            ? filteredLikedPosts.slice(0, 10)
            : filteredLikedPosts
          : null,
    });

    global.SocketService.handleGetMostDiscussedPosts({
      event: "most-discussed-posts",
      // @ts-ignore
      posts: filteredDiscussedPostsPosts.length
        ? filteredDiscussedPostsPosts.length > 10
          ? filteredDiscussedPostsPosts.slice(0, 10)
          : filteredDiscussedPostsPosts
        : null,
    });

    global.SocketService.handleGetMostAwardedPosts({
      event: "most-awarded-posts",
      // @ts-ignore
      posts: filteredAwardedPosts.length
        ? filteredAwardedPosts.length > 10
          ? filteredAwardedPosts.slice(0, 10)
          : filteredAwardedPosts
        : null,
    });
  } catch (error) {
    console.log(error);
    console.log("Get Most Viewed Posts Cron Rejected");
    throw new Error(error);
  }
});
