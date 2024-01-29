import moment from "moment";
import { socialArtDB } from "../index";
import { ReportInterface } from "../interfaces/report.interface";

class Report {
  report: ReportInterface;
  constructor(report: ReportInterface) {
    this.report = report;
  }

  async create(uuid) {
    try {
      const tableQuery =
        "CREATE TABLE IF NOT EXISTS reports (reportId VARCHAR(45) PRIMARY KEY NOT NULL, message LONGTEXT, type VARCHAR(45), status VARCHAR(45), typeId VARCHAR(45), referEmail VARCHAR(45), reporterId VARCHAR(45), createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL)";

      await socialArtDB.query(tableQuery);

      const insertQuery = `INSERT INTO reports (reportId, type, status, typeId, referEmail, message, reporterId, createdAt, updatedAt) VALUES (
          "${uuid}",
          "${this.report.type || ""}",
          "${this.report.status || ""}",
          "${this.report.typeId || ""}",
          "${this.report.referEmail || ""}",
          "${this.report.message || ""}",
          "${this.report.reporterId || ""}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}",
          "${moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ")}"
          )`;

      await socialArtDB.query(insertQuery);

      const sql = `SELECT * FROM reports WHERE reportId = "${uuid}"`;

      return socialArtDB.query(sql);
    } catch (error) {
      throw new Error(error);
    }
  }

  static query(query: string) {
    try {
      return socialArtDB.query(query);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default Report;
