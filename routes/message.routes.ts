import ChatManagerController from "../controllers/chatManager.controller";
import express from "express";
const router = express.Router();

router.post("/liveStream/newMessage",ChatManagerController.sendMessage);
router.get("/liveStream/messages",ChatManagerController.getStreamMessage);

router.post("/thread/newMessage",ChatManagerController.sendThreadMessage);
router.post("/thread/create",ChatManagerController.createThread);
router.patch("/thread/update",ChatManagerController.updateChatThread)
router.get("/thread/getList",ChatManagerController.getThreadList);
router.get("/thread/getUserList",ChatManagerController.getThreadUserList);
router.get("/thread/getMessages",ChatManagerController.getThreadMessage);

module.exports = router;