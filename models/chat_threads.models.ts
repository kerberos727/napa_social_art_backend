import moment from "moment";
import { socialArtDB } from "../index";
import { ChatThreadsInterface } from "../interfaces/chat_threads.interface";

class ChatThreads {
  chatThreads: ChatThreadsInterface;
  constructor(chatThreads: ChatThreadsInterface) {
    this.chatThreads = chatThreads;
  }

  async create(uuid) {
    try {
      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS chat_threads (
                    rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY,
                    threadId VARCHAR(45) PRIMARY KEY NOT NULL,
                    name VARCHAR(255) NULL,
                    threadStatus ENUM('0', '1', '2', '3') DEFAULT '0',
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`;
      await socialArtDB.query(createTableQuery);
      const insertQuery = `
                INSERT INTO chat_threads (
                    rowId,
                    threadId,
                    name,
                    threadStatus,
                    createdAt,
                    updatedAt
                ) VALUES (
                    "${this.chatThreads.rowId || ""}",
                    "${uuid}",
                    "${this.chatThreads.name || ""}",
                    "${this.chatThreads.threadStatus || 1}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
                )`;
      await socialArtDB.query(insertQuery);

      const sql = `SELECT chat_threads.* From chat_threads WHERE threadId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static updateChatThread(
    threadId,
    threadStatus,
  ) {
    try {
      let updateQuery = `UPDATE chat_threads SET threadStatus = '${threadStatus}'`;

      updateQuery += ` WHERE threadId = '${threadId}'`;

      return socialArtDB.query(updateQuery);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getThreadData(threadId) {
    const query = `SELECT * From chat_threads Where chat_threads.threadId = '${threadId}'`;
    return socialArtDB.query(query);
  }


  static async getThreadDataInfo(threadId, profileId) {
    const query = `SELECT * From chat_threads Where chat_threads.threadId = '${threadId}'`;
    const [threadInfo] = await socialArtDB.query(query);
    const queryRecevier = `SELECT users.profileName, users.avatar From users Where users.profileId = '${profileId}'`;
    const [threadReceiverInfo] = await socialArtDB.query(queryRecevier);
    const finalThreadResponse = threadInfo[0]?threadInfo[0]:[];
    finalThreadResponse.profileName = threadReceiverInfo[0]?.profileName?threadReceiverInfo[0]?.profileName:'';
    finalThreadResponse.avatar = threadReceiverInfo[0]?.avatar?threadReceiverInfo[0]?.avatar:'';
    return finalThreadResponse;
  }

  static async getThreadList(profileId) {
    const threadArr = [];
    const query = `SELECT DISTINCT(ct.threadId), ct.name, ct.threadStatus, ct.createdAt, ct.updatedAt FROM thread_user INNER JOIN chat_threads ct ON thread_user.threadId = ct.threadId Where thread_user.profileId = '${profileId}'`;
    const [threadRawArr]: any = await socialArtDB.query(query);

    for (const row of threadRawArr) {
      const { threadId } = row;
      if (threadId) {
        const checkReceiverQuery = `SELECT thread_user.*, u.profileName, u.avatar
        FROM thread_user
        JOIN users u ON thread_user.profileId = u.profileId
        WHERE thread_user.threadId = '${threadId}' AND thread_user.profileId <> '${profileId}'`;
        const [threadRawArr]: any = await socialArtDB.query(checkReceiverQuery);
        if(threadRawArr?.length > 0)
        {
          row['receiver_info'] = threadRawArr[0];
        }
        else{
          row['receiver_info'] = "";
        }

        
        const queryForFetchLastMessage = `SELECT messages.text,messages.createdAt, u.profileId FROM messages JOIN users u ON messages.profileId = u.profileId Where messages.threadId = '${threadId}' ORDER BY messages.createdAt DESC LIMIT 1`;
        const [lastMessageArr]: any = await socialArtDB.query(queryForFetchLastMessage);
        if(lastMessageArr?.length > 0)
        {
          row['last_message'] = lastMessageArr[0];
        }
        else{
          row['last_message'] = "";
        }

      }
      threadArr.push(row);
    }

    return threadArr;
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
export default ChatThreads;
