import { socialArtDB } from "../index";
import { MintedPostsInterface } from "../interfaces/minted-posts.interface";
class MintedPosts {
  post: MintedPostsInterface;
  constructor(post: MintedPostsInterface) {
    this.post = post;
  }

  async create(uuid, mintedTime, tokenUri) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS minted_posts (postId VARCHAR(45) NOT NULL, mintId VARCHAR(45) PRIMARY KEY NOT NULL, videoType VARCHAR(45), generatorId VARCHAR(45) NOT NULL,profileId VARCHAR(45) NOT NULL, network VARCHAR(45), status ENUM('0', '1', '2', '3', '4', '5') NOT NULL DEFAULT '0', SNFTTitle VARCHAR(45) NOT NULL, SNFTCollection VARCHAR(45) NOT NULL, SNFTDescription VARCHAR(45) NOT NULL, location VARCHAR(45), taggedPeople VARCHAR(2000), genre VARCHAR(45), tags VARCHAR(2000), live ENUM('1', '2', '3', '4', '5') NOT NULL DEFAULT '1', payoutApproved ENUM('0', '1', '2', '3', '4') NOT NULL DEFAULT '0', SNFTAddress VARCHAR(45), networkTxId VARCHAR(45), owner VARCHAR(45), thumbnail LONGTEXT NOT NULL, timeMinted TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, marketplace_listed TEXT NOT NULL, napaTokenEarned VARCHAR(45), tokenUri VARCHAR(45) UNIQUE, tokenId INTEGER AUTO_INCREMENT NOT NULL UNIQUE, FOREIGN KEY (postId) REFERENCES posted_videos (postId))";
      await socialArtDB.query(tableQuery);
      const insertQuery = `INSERT INTO minted_posts (
          postId,
          mintId,
          videoType,
          generatorId,
          profileId,
          network,
          status,
          SNFTTitle,
          SNFTCollection,
          SNFTDescription,
          location,
          taggedPeople,
          genre,
          tags,
          live,
          payoutApproved,
          SNFTAddress,
          networkTxId,
          owner,
          thumbnail,
          createdAt,
          updatedAt,
          timeMinted,
          marketplace_listed,
          napaTokenEarned,
          tokenUri
        ) VALUES (
          "${this.post.postId}",
          "${uuid}",
          "${this.post.videoType || ""}",
          "${this.post.generatorId || ""}",
          "${this.post.profileId || ""}",
          "${this.post.network || ""}",
          "${this.post.status || "0"}",
          "${this.post.SNFTTitle || ""}",
          "${this.post.SNFTCollection || ""}",
          "${this.post.SNFTDescription || ""}",
          "${this.post.location || ""}",
          "${this.post.taggedPeople || ""}",
          "${this.post.genre || ""}",
          "${this.post.tags || ""}",
          ${this.post.live || 1},
          ${this.post.payoutApproved || "0"},
          "${this.post.SNFTAddress || ""}",
          "${this.post.networkTxId || ""}",
          "${this.post.owner || ""}",
          "${this.post.thumbnail || ""}",
          "${mintedTime}",
          "${mintedTime}",
          "${mintedTime}",
          "${this.post.marketplace_listed || "false"}",
          "${this.post.napaTokenEarned || ""}",
          "${tokenUri}"
        )
      `;

      await socialArtDB.query(insertQuery);
      const sql = `SELECT postId, mintId, SNFTAddress, networkTxId, owner FROM minted_posts WHERE mintId = "${uuid}"`;
      return await socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getAllMintedPosts(accountId, offset) {
    //   const date = moment(new Date())
    //   .add(1, "day")
    //   .format("YYYY-MM-DDTHH:mm:ssZ");
    // const prevDate = moment(new Date())
    //   .subtract(1, "days")
    //   .format("YYYY-MM-DDTHH:mm:ssZ");
    try {
      const sql = `SELECT minted_posts.*, snft_transactions.payoutsCategory, snft_transactions.closingDate FROM minted_posts JOIN snft_transactions ON minted_posts.mintId = snft_transactions.mintId WHERE generatorId = "${accountId}" AND owner = "${accountId}" ORDER BY createdAt DESC LIMIT ${offset}, 6`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getRecentMintedPosts() {
    try {
      const sql = `SELECT minted_posts.postId, minted_posts.mintId, minted_posts.profileId, minted_posts.thumbnail, users.profileName, users.avatar FROM minted_posts JOIN users ON minted_posts.profileId = users.profileId ORDER BY minted_posts.createdAt DESC LIMIT 0, 5`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getMintedPost(id) {
    try {
      const sql = `SELECT minted_posts.*, posted_videos.videoURL as videoURL, posted_videos.mobileVideoURL as mobileVideoURL, posted_videos.videoThumbnail as videoThumbnail FROM minted_posts JOIN posted_videos ON minted_posts.postId = posted_videos.postId WHERE mintId = "${id}" OR snftId = "${id}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getHighestEarningMintedPost(profileId) {
    try {
      const sql = `SELECT minted_posts.*, posted_videos.videoURL as videoURL, posted_videos.mobileVideoURL as mobileVideoURL, posted_videos.videoThumbnail as videoThumbnail FROM minted_posts JOIN posted_videos ON minted_posts.postId = posted_videos.postId WHERE minted_posts.profileId = "${profileId}" ORDER BY minted_posts.createdAt`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default MintedPosts;
