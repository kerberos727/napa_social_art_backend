import { napaDB } from "../index";

class Trending {
  static getAllTrendingFeeds(status) {
    try {
      const sql = `SELECT * FROM trending WHERE articleStatus = "${status}" ORDER BY updatedAt DESC`;

      return napaDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getTrending(articleId) {
    try {
      const sql = `SELECT * FROM trending WHERE articleId = "${articleId}"`;

      return napaDB.execute(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Trending;
