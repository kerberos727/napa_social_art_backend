/* eslint-disable @typescript-eslint/no-var-requires */
import { v4 as uuidv4 } from "uuid";
import { ApiResponse } from "../utils/index.utils";
import { Reports } from "../models/index.models";
import { napaDB } from "../index";

const { sendEmail } = require("../utils/nodemailer");
const ejs = require("ejs");
import path from "path";

const ReportsController = {
  createReport: async (req, res) => {
    try {
      const uuid = uuidv4();
      const newReport = new Reports(req.body);
      const [reportData] = await newReport.create(uuid);
      const reporterProfileQuery = `SELECT * FROM users WHERE profileId = "${req.body.reporterId}"`;
      const [userProfileResponse] = await napaDB.query(reporterProfileQuery);
      const userProfile = userProfileResponse[0];
      const file = await ejs.renderFile(
        path.join(__dirname, "..", "views/report.ejs"),
        {
          user_name: userProfile?.profileName,
          message: req.body.message,
        }
      );
      sendEmail(process.env.REPORT_EMAIL, file, "NAPA Partners Portal Login");
      return ApiResponse.successResponseWithData(
        res,
        "Report Created Successfully",
        reportData[0]
      );
    } catch (error) {
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getAllReports: async (req, res) => {
    try {
      const getAllReportsQuery = `SELECT * FROM reports`;
      const [reportData] = await Reports.query(getAllReportsQuery);

      return ApiResponse.successResponseWithData(
        res,
        "Report Created Successfully",
        reportData[0]
      );
    } catch (error) {
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getOneReport: async (req, res) => {
    try {
      const getAllReportsQuery = `SELECT * FROM reports WHERE reportId = "${req.params.reportId}"`;
      const [reportData] = await Reports.query(getAllReportsQuery);

      return ApiResponse.successResponseWithData(
        res,
        "Report Created Successfully",
        reportData[0]
      );
    } catch (error) {
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },
};

export default ReportsController;
