import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { socialArtDB } from "../index";
import { MessagesInterface } from "../interfaces/messages.interface";
import ChatThreads from "./chat_threads.models";
import ThreadUser from "./thread_users.models";

class Messages {
  message: MessagesInterface;
  constructor(message: MessagesInterface) {
    this.message = message;
  }

  async create(uuid) {
    try {
      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS messages (
                    rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY,
                    messageId VARCHAR(45) PRIMARY KEY NOT NULL,
                    threadId VARCHAR(45) NULL,
                    streamId VARCHAR(45) NULL,
                    profileId VARCHAR(45),
                    text TEXT,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (profileId) REFERENCES users(profileId)
                )`;
      await socialArtDB.query(createTableQuery);
      const insertQuery = `
                INSERT INTO messages (
                    rowId,
                    messageId,
                    threadId,
                    streamId,
                    profileId,
                    text,
                    createdAt,
                    updatedAt
                ) VALUES (
                    "${this.message.rowId || ""}",
                    "${uuid}",
                    "${this.message.threadId || ""}",
                    "${this.message.streamId || ""}",
                    "${this.message.profileId || ""}",
                    "${this.message.text || ""}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
                )`;
      await socialArtDB.query(insertQuery);

      const sql = `SELECT messages.*, u.profileName, u.avatar FROM messages JOIN users u ON messages.profileId = u.profileId WHERE messageId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getMessages(params) {
    let query = `SELECT *, u.profileName, u.avatar FROM messages JOIN users u ON messages.profileId = u.profileId`;

    if (params.threadId) {
      query += ` Where messages.threadId = '${params.threadId}'`;
    }
    else if (params.streamId) {
      query += ` Where messages.streamId = '${params.streamId}'`;
    }

    query += ` ORDER BY messages.createdAt DESC`;
    return socialArtDB.query(query);
  }

  static async checkThreadExist(params) {

    if (params.profileId && params.receiverProfileId)
    {
        const query2 = `SELECT DISTINCT (threadId)
        FROM thread_user
        WHERE threadId IN (
            SELECT threadId
            FROM thread_user
            WHERE profileId = '${params.receiverProfileId}'
        )
        AND threadId IN (
            SELECT threadId
            FROM thread_user
            WHERE profileId = '${params.profileId}'
        )`;
        const [threadData]: any = await socialArtDB.query(query2);
        if(threadData.length > 0)
        {
          const rawThreadId = threadData[0]?.threadId;
          const messageData:any = await Messages.getMessages({threadId: rawThreadId});
          const threadRawData = await ChatThreads.getThreadDataInfo(rawThreadId, params.receiverProfileId);
          const finalData = {
            'threadInfo' : threadRawData,
            'messageData' : messageData.length > 0 ? messageData[0] : [],
          }
          return finalData;
        }
    }

    return null;
  }

  static async checkThread(params) {

    if (params.profileId && params.receiverProfileId)
    {
        const query2 = `SELECT DISTINCT (threadId)
        FROM thread_user
        WHERE threadId IN (
            SELECT threadId
            FROM thread_user
            WHERE profileId = '${params.receiverProfileId}'
        )
        AND threadId IN (
            SELECT threadId
            FROM thread_user
            WHERE profileId = '${params.profileId}'
        )`;
        const [threadData]: any = await socialArtDB.query(query2);
        if(threadData.length > 0)
        {
          const rawThreadId = threadData[0]?.threadId;
          return {threadId: rawThreadId};
        }
        else
        {
          const uuidForThread = uuidv4();
          const profileId = params.profileId;
          const receiverProfileId = params.receiverProfileId;

          const newThread = new ChatThreads(profileId);
          const [threadData] = await newThread.create(uuidForThread);

          const threadId: any = threadData[0]?.threadId ? threadData[0]?.threadId : null;

          global.SocketService.handleNewAddedThread({
            threadId: threadId,
            data: newThread[0],
          });

          // add for profileId
          if(profileId) {
            const newProfileUuid = uuidv4();
            const requestBody: any = {
              profileId: profileId,
              threadId: threadId,
            }
            const newThreadUser: any = new ThreadUser(requestBody);
            await newThreadUser.create(newProfileUuid);
          }

          // add for receiverProfileId
          if(receiverProfileId)
          {
              const newOtherUuid = uuidv4();
              const requestBody: any = {
                profileId: receiverProfileId,
                threadId: threadId,
              }
              const newThreadTargetUser: any = new ThreadUser(requestBody);
              await newThreadTargetUser.create(newOtherUuid);
          }
          return {threadId: threadId};
        }
    }

    return null;
  }
  catch(error) {
    throw new Error(error);
  }

  static query(query: string) {
    try {
      return socialArtDB.query(query);
    } catch (error) {
      throw new Error(error);
    }
  }
}
export default Messages;