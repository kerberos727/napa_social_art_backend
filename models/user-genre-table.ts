import { socialArtDB } from "../index";
import moment from "moment";

class UserGenreTable {
  genere: any;
  constructor(genere: any) {
    this.genere = genere;
  }
  async create() {
    const genereAllowed = ['Comedy', 'Fashion', 'Sports', 'Cars', 'Lifestyle', 'Metaverse', 'Politics', 'Adventure', 'Drama', 'Travel', 'Food', 'Parties', 'Festivals', 'Skits', 'Challenges']
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS user_genre_table (rowId INTEGER AUTO_INCREMENT NOT NULL UNIQUE KEY, profileId VARCHAR(45), genre_id_01 VARCHAR(45), genre_id_02 VARCHAR(45), genre_id_03 VARCHAR(45), genre_id_04 VARCHAR(45), genre_id_05 VARCHAR(45), genre_id_06 VARCHAR(45), genre_id_07 VARCHAR(45), genre_id_08 VARCHAR(45), genre_id_09 VARCHAR(45), genre_id_10 VARCHAR(45), genre_id_11 VARCHAR(45), genre_id_12 VARCHAR(45), genre_id_13 VARCHAR(45), genre_id_14 VARCHAR(45), genre_id_15 VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (profileId) REFERENCES users (profileId))";

        console.log("this.genere.genereSelected.includes(genereAllowed[0])", this.genere.genereSelected.includes(genereAllowed[0]));
        
      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO user_genre_table (profileId, genre_id_01, genre_id_02, genre_id_03, genre_id_04, genre_id_05, genre_id_06, genre_id_07, genre_id_08, genre_id_09, genre_id_10, genre_id_11, genre_id_12, genre_id_13, genre_id_14, genre_id_15, createdAt, updatedAt) VALUES (
          "${this.genere.profileId || ""}",
          "${this.genere.genereSelected.includes(genereAllowed[0]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[1]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[2]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[3]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[4]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[5]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[6]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[7]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[8]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[9]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[10]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[11]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[12]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[13]) ? "true" : "false"}",
          "${this.genere.genereSelected.includes(genereAllowed[14]) ? "true" : "false"}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM user_genre_table WHERE profileId = "${this.genere.profileId}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getAllGenres() {
    try {
      const sql = `SELECT * FROM user_genre_table ORDER BY updatedAt DESC`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static getGenre(profileId: string) {
    try {
      const sql = `SELECT * FROM user_genre_table WHERE profileId = "${profileId}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async updateGenre(profileId: string, genereSelected) {
    const genereAllowed = ['Comedy', 'Fashion', 'Sports', 'Cars', 'Lifestyle', 'Metaverse', 'Politics', 'Adventure', 'Drama', 'Travel', 'Food', 'Parties', 'Festivals', 'Skits', 'Challenges']
    try {
      const updateQuery = `UPDATE user_genre_table SET genre_id_01 = "${genereSelected.includes(genereAllowed[0]) ? "true" : "false"}", genre_id_02 = "${genereSelected.includes(genereAllowed[1]) ? "true" : "false"}", genre_id_03 = "${genereSelected.includes(genereAllowed[2]) ? "true" : "false"}", genre_id_04 = "${genereSelected.includes(genereAllowed[3]) ? "true" : "false"}", genre_id_05 = "${genereSelected.includes(genereAllowed[4]) ? "true" : "false"}", genre_id_06 = "${genereSelected.includes(genereAllowed[5]) ? "true" : "false"}", genre_id_07 = "${genereSelected.includes(genereAllowed[6]) ? "true" : "false"}", genre_id_08 = "${genereSelected.includes(genereAllowed[7]) ? "true" : "false"}", genre_id_09 = "${genereSelected.includes(genereAllowed[8]) ? "true" : "false"}", genre_id_10 = "${genereSelected.includes(genereAllowed[9]) ? "true" : "false"}", genre_id_11 = "${genereSelected.includes(genereAllowed[10]) ? "true" : "false"}", genre_id_12 = "${genereSelected.includes(genereAllowed[11]) ? "true" : "false"}", genre_id_13 = "${genereSelected.includes(genereAllowed[12]) ? "true" : "false"}", genre_id_14 = "${genereSelected.includes(genereAllowed[13]) ? "true" : "false"}", genre_id_15 = "${genereSelected.includes(genereAllowed[14]) ? "true" : "false"}" WHERE profileId = "${profileId}"`;
      await socialArtDB.query(updateQuery);

      const sql = `SELECT * FROM user_genre_table WHERE profileId = "${profileId}"`;
      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default UserGenreTable;
