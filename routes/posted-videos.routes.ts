import express from "express";
const router = express.Router();
import {
  PostedVideosController,
  MintedPostController,
  CommentsController,
  MarketPlaceController,
  TrendingController,
  EventController,
  TransactionController,
  OffersController,
  RewardsTrackingController,
  SnftTransactionController,
  StakingController,
  UserGenreController,
  FanController,
  NotificationController,
} from "../controllers/index.controllers";

import {
  walletValidator,
  typeValidation,
} from "../middleware/index.middleware";
import { validationRules } from "../utils/index.utils";

import multer from "multer";

const videoUpload = multer({
  fileFilter(req, file, cb) {
    if (
      !file.originalname.endsWith(".mp4") &&
      !file.originalname.endsWith(".webm")
    ) {
      cb(new Error("Please select a mp4 or webm file"));
    }
    cb(undefined, true);
  },
});

const imageUpload = multer({
  fileFilter(req, file, cb) {
    if (
      !file.originalname.endsWith(".png") &&
      !file.originalname.endsWith(".jpg") &&
      !file.originalname.endsWith(".jpeg")
    ) {
      cb(new Error("Please select a jpg or png file"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/social/video/new",
  // videoUpload.single("videoFile"),
  multer().fields([{ name: 'videoFile', maxCount: 1 },{ name: 'videoThumbnail', maxCount: 1 }]),
  walletValidator,
  typeValidation(validationRules.videoValidationRules),
  PostedVideosController.createPost
);
router.get("/social/video/list", PostedVideosController.getAllPosts);
router.get("/social/video/mylist", PostedVideosController.getMyPosts);
router.get(
  "/social/video/detail/:postId",
  PostedVideosController.getPostDetails
);
router.post(
  "/social/video/like",
  typeValidation(validationRules.likePostRule),
  PostedVideosController.likePost
);
router.post(
  "/social/video/award",
  typeValidation(validationRules.awardPostRule),
  PostedVideosController.awardPost
);
router.post(
  "/social/video/notification",
  PostedVideosController.sendNotification
);
router.get(
  "/social/video/activeusers/count",
  PostedVideosController.getActiveUsersCount
);
router.get(
  "/social/video/napausers/count",
  PostedVideosController.getTotalNapaUsersCount
);
router.get("/social/video/mostviewed", PostedVideosController.getMostViewed);
router.post("/social/video/views", PostedVideosController.updateViewsCount);
router.get("/social/video/views", PostedVideosController.getViews);
router.post("/getLambdaOutput", PostedVideosController.getLambdaOutput);
router.post("/getLambdaError", PostedVideosController.getLambdaError);

router.post(
  "/social/mint/new",
  imageUpload.single("thumbnail"),
  typeValidation(validationRules.mintPostRule),
  MintedPostController.mintPost
);
router.post(
  "/social/mint/update/:mintId",
  typeValidation(validationRules.updateMintPostRule),
  MintedPostController.updateMintPosts
);
router.post(
  "/social/mint/update/status/:postId",
  MintedPostController.updateMinPostStatus
);
router.get("/social/mint", MintedPostController.getAllMintedPosts);
router.get("/social/mint/details", MintedPostController.getMintedPost);
router.get("/social/mint/recent", MintedPostController.getRecentMintedPosts);
router.get("/social/mint/highestEarning", MintedPostController.getHighestEarningMintedPost);

router.post(
  "/social/comment/new",
  typeValidation(validationRules.newCommentRule),
  CommentsController.createComment
);
router.get("/social/comment/:postId", CommentsController.getCommentsByPostId);
router.get(
  "/social/comment/count/:postId",
  CommentsController.getCommentsCountByPosId
);
router.patch("/social/comment/:postId/like", CommentsController.likeComment);
router.post(
  "/social/comment/delete",
  // typeValidation(validationRules.newCommentRule),
  CommentsController.deleteComment
);

router.post("/marketplace/snft/new", MarketPlaceController.createSnft);
router.get("/marketplace/snft/list", MarketPlaceController.getAllSnfts);
router.get("/marketplace/mysnfts/list", MarketPlaceController.getMySnfts);
router.post("/marketplace/snft/delete/:id", MarketPlaceController.deleteSnft);
router.post("/marketplace/snft/update/:id", MarketPlaceController.updateSnft);
router.get("/marketplace/snft/:snftId", MarketPlaceController.getSnft);
router.post("/marketplace/snft/buy/:id", MarketPlaceController.buySnft);
router.post("/marketplace/pinToIPFS", MarketPlaceController.pinToIPFS);
router.post(
  "/marketplace/updateSaleStatus",
  MarketPlaceController.updateSaleStatus
);

router.get("/trending/feed/list", TrendingController.getAllTrendings);
router.get("/social/feed/:articleId", TrendingController.getTrending);
router.get("/social/events/list", EventController.getAllEvents);
router.get("/social/event/:eventId", EventController.getEvent);

router.post("/transaction/new", TransactionController.create);
router.post("/offer/new", OffersController.create);
router.get("/offer", OffersController.getOffers);

router.post("/payoutstracking/create", RewardsTrackingController.create);
router.post("/social/mint/redeemtoken/:id", SnftTransactionController.redeem);

router.post("/staking/new", StakingController.create);
router.get("/staking", StakingController.get);

router.post("/genre/new", UserGenreController.create);
router.get("/genre/list", UserGenreController.getAllGenres);
router.get("/genre", UserGenreController.getGenre);
router.patch("/genre", UserGenreController.updateGenre);

router.post(
  "/social/fan/new",
  typeValidation(validationRules.fanValidationRules),
  FanController.create
);
router.patch(
  "/social/fan/update",
  typeValidation(validationRules.fanValidationRules),
  FanController.update
);
router.get("/social/followers", FanController.getYourFans);
router.get("/social/following", FanController.getFansYouFollow);
router.get("/search", FanController.serarchUsers);
router.post("/social/sendNotification", NotificationController.send);

// awards endpoints
// router.post("/social/award/new", CommentsController.createComment);

export default router;
