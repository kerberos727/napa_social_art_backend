import moment from "moment";
import { socialArtDB } from "../index";
import { ThreadUserInterface } from "../interfaces/thread_user.interface";

class ThreadUser {
  threadUser: ThreadUserInterface;
  constructor(threadUser: ThreadUserInterface) {
    this.threadUser = threadUser;
  }

  async create(uuid) {
    try {
      const createTableQuery = `
                CREATE TABLE IF NOT EXISTS thread_user (
                    rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY,
                    mappingId VARCHAR(45) PRIMARY KEY NOT NULL,
                    threadId VARCHAR(45),
                    profileId VARCHAR(45),
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (profileId) REFERENCES users(profileId),
                    FOREIGN KEY (threadId) REFERENCES chat_threads(threadId)
                )`;
      await socialArtDB.query(createTableQuery);
      const insertQuery = `
                INSERT INTO thread_user (
                    rowId,
                    mappingId,
                    threadId,
                    profileId,
                    createdAt,
                    updatedAt
                ) VALUES (
                    "${this.threadUser.rowId || ""}",
                    "${uuid}",
                    "${this.threadUser.threadId || ""}",
                    "${this.threadUser.profileId || ""}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
                    "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
                )`;
      await socialArtDB.query(insertQuery);

      const sql = `SELECT thread_user.*, u.profileName, u.avatar FROM thread_user JOIN users u ON thread_user.profileId = u.profileId WHERE mappingId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getThreadUserList(params) {
    let query = `SELECT *, u.profileName, u.avatar FROM thread_user JOIN users u ON thread_user.profileId = u.profileId`;

    if (params.threadId) {
      query += ` Where thread_user.threadId = '${params.threadId}'`;
    }

    query += ` ORDER BY thread_user.createdAt DESC`;
    return socialArtDB.query(query);
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
export default ThreadUser;
