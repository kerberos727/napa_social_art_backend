import { v4 as uuidv4 } from "uuid";
import { PostedVideos } from "../models/index.models";
import { ApiResponse } from "../utils/index.utils";
import { napaDB, socialArtDB } from "../index";
import Message from "../models/messages.models";
import ChatThreads from "../models/chat_threads.models";
import ThreadUser from "../models/thread_users.models";

const ChatManagerController = {
  createThread: async (req, res) => {
    const { profileId, threadUserIds } = req.body;

    try {
      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      //@ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const checkNapaAccountsQuery = `SELECT * FROM napa_accounts WHERE profileId = "${profileId}"`;
      const [existingNapaAccount] = await napaDB.query(checkNapaAccountsQuery);

      //@ts-ignore
      if (!existingNapaAccount.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "A napa account does not exist for this profile"
        );
      }

      const newThread = new ChatThreads(req.body);
      const [threadData] = await newThread.create(uuid);

      if(profileId) {
        req.body.threadId = threadData[0]?.threadId;
        req.body.profileId = profileId;
        const newProfileUuid = uuidv4();
        const newThreadUser = new ThreadUser(req.body);
        await newThreadUser.create(newProfileUuid);
      }

      // add for other userIds
      if(threadUserIds.length > 0)
      {
        threadUserIds.forEach( async userId => {
          req.body.threadId = threadData[0]?.threadId;
          req.body.profileId = userId;

          const newOtherUuid = uuidv4();
          const newThreadUser = new ThreadUser(req.body);
          await newThreadUser.create(newOtherUuid);
        });
      }

      global.SocketService.handleNewAddedThread({
        threadId: threadData[0]?.threadId,
        data: threadData[0],
      });
      

      return ApiResponse.successResponseWithData(
        res,
        "Thread Created Successfully",
        threadData[0]
      );
    } catch (error) {
      console.log('error', error);
      console.log("Create Thread Api Rejected");
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  updateChatThread: async (req, res) => {
    const {
      threadId,
      threadStatus,
    } = req.body;

    try {
      const threadIdQuery = `SELECT * FROM chat_threads WHERE threadId = "${threadId}"`;
      const [threadIds] = await socialArtDB.query(threadIdQuery);

      //@ts-ignore
      if (!threadIds.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Thread Not Found"
        );
      }

      if (threadStatus && threadId) {
        const [updateThread] = await ChatThreads.updateChatThread(
          threadId,
          threadStatus,
        );
      }

      const threadData = await ChatThreads.getThreadData({ threadId });
      if (threadStatus == 1) {
        // threadId
      } else {
        // threadId
      }

      return ApiResponse.successResponseWithData(
        res,
        "Thread updated successfully",
        threadData[0][0]
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while updating the Thread"
      );
    }
  },

  getThreadList: async (req, res) => {
    try {
      const {profileId} = req.query;
      const offers = await ChatThreads.getThreadList(profileId);
      // @ts-ignore
      if (!offers?.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Thread Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Thread List Successfully",
        // @ts-ignore
        offers.length ? offers : null
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the thread"
      );
    }
  },

  getThreadMessage: async (req, res) => {
    try {
      if (req.query.profileId && req.query.receiverProfileId)
      {
        const threadData:any = await Message.checkThreadExist(req.query);
        if (!threadData?.threadInfo) {
          return ApiResponse.successResponseWithData(
            res,
            "Get Message Successfully",
            {
              threadInfo: null,
              messageData: []
            }
          );
        }
        return ApiResponse.successResponseWithData(
          res,
          "Get Message Successfully",
          threadData
        );
      }
      else if (req.query.threadId)
      {
        const profileQuery = `SELECT COUNT(*) as totalCount FROM chat_threads WHERE chat_threads.threadId = "${req.query.threadId}"`;
        const [threadCheck] = await socialArtDB.query(profileQuery);
        const totalCount = threadCheck[0]?.totalCount ? threadCheck[0]?.totalCount : 0;

        if (totalCount == 0) {
          return ApiResponse.validationErrorWithData(res, "Thread Not Found");
        }

        const [offers]:any = await Message.getMessages(req.query);

        let receiverProfileId = req.query.profileId;

        const checkReceiverQuery = `SELECT thread_user.profileId
        FROM thread_user WHERE thread_user.threadId = '${req.query.threadId}' AND thread_user.profileId <> '${req.query.profileId}' LIMIT 1`;
        const [threadRawArr]: any = await socialArtDB.query(checkReceiverQuery);

        if(threadRawArr?.length > 0)
        {
          receiverProfileId = threadRawArr[0]?.profileId;
        }

        const threadRawData = await ChatThreads.getThreadDataInfo(req.query.threadId, receiverProfileId);
        const finalData = {
          'threadInfo' : threadRawData,
          'messageData' : offers?.length > 0 ? offers : [],
        }

        return ApiResponse.successResponseWithData(
          res,
          "Get Message Successfully",
          finalData
        );
      }
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the messages"
      );
    }
  },

  getThreadUserList: async (req, res) => {
    try {
      const [offers] = await ThreadUser.getThreadUserList(req.query);
      // @ts-ignore
      if (!offers.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Users Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Users Successfully",
        // @ts-ignore
        offers.length ? offers : null
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the users list"
      );
    }
  },

  sendMessage: async (req, res) => {
    const { profileId } = req.body;

    try {
      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      //@ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const checkNapaAccountsQuery = `SELECT * FROM napa_accounts WHERE profileId = "${profileId}"`;
      const [existingNapaAccount] = await napaDB.query(checkNapaAccountsQuery);

      //@ts-ignore
      if (!existingNapaAccount.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "A napa account does not exist for this profile"
        );
      }

      const newMessage:any = new Message(req.body);
      const [messageData] = await newMessage.create(uuid);

      global.SocketService.handleLiveStreamSendMessage({
        threadId: messageData[0]?.threadId,
        data: messageData[0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Message Send Successfully",
        messageData[0]
      );
    } catch (error) {
      console.log('error', error);
      console.log("Create Message Api Rejected");
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  sendThreadMessage: async (req, res) => {
    const { profileId } = req.body;

    try {
      const uuid = uuidv4();

      const profileQuery = `SELECT * FROM users WHERE profileId = "${profileId}"`;
      const [profile] = await PostedVideos.query(profileQuery);

      //@ts-ignore
      if (!profile.length) {
        return ApiResponse.validationErrorWithData(res, "Profile Not Found");
      }

      const checkNapaAccountsQuery = `SELECT * FROM napa_accounts WHERE profileId = "${profileId}"`;
      const [existingNapaAccount] = await napaDB.query(checkNapaAccountsQuery);

      //@ts-ignore
      if (!existingNapaAccount.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "A napa account does not exist for this profile"
        );
      }

      let threadId = "";
      if (req?.body?.profileId && req?.body?.receiverProfileId)
      {
        const threadData:any = await Message.checkThread(req.body);
        if (!threadData.threadId) {
          return ApiResponse.validationErrorWithData(
            res,
            "Thread Not Found"
          );
        }
        threadId = threadData.threadId;
      }
      
      if(!req?.body?.threadId && !threadId)
      {
        return ApiResponse.validationErrorWithData(
          res,
          "Thread Not Found"
        );
      }

      // if thread not found then need to create new for save message
      if(threadId)
      {
        req.body.threadId = threadId;
      }

      const newMessage:any = new Message(req.body);
      const [messageData] = await newMessage.create(uuid);

      global.SocketService.handleThreadSendMessage({
        threadId: messageData[0]?.threadId,
        data: messageData[0],
      });

      return ApiResponse.successResponseWithData(
        res,
        "Message Send Successfully",
        messageData[0]
      );
    } catch (error) {
      console.log('error', error);
      console.log("Create Message Api Rejected");
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getStreamMessage: async (req, res) => {
    try {
      const [offers] = await Message.getMessages(req.query);
      // @ts-ignore
      if (!offers.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Message Not Found"
        );
      }
      return ApiResponse.successResponseWithData(
        res,
        "Get Message Successfully",
        // @ts-ignore
        offers.length ? offers : null
      );
    } catch (error) {
      console.log("Error:", error);
      return ApiResponse.validationErrorWithData(
        res,
        "An error occurred while getting the messages"
      );
    }
  },


};
export default ChatManagerController;
