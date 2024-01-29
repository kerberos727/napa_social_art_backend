import { Transaction } from "../models/index.models";
import ApiResponse from "../utils/api-response";
import { v4 as uuidv4 } from "uuid";
import { socialArtDB } from "../index";
import { sendNotification } from "../utils/send-notification";

const NotificationController = {
  send: async (req, res) => {
    try {
      console.log("Send Notification Api Pending");

      const { title, body } = req.body;

      if (!title) {
        return ApiResponse.ErrorResponse(res, "Title is required");
      }

      if (!body) {
        return ApiResponse.ErrorResponse(res, "Body is required");
      }

      const getUsersTokenDevices = `SELECT deviceToken FROM users WHERE deviceToken != "undefined" AND deviceToken != ""`;
      const [usersTokenDevices]: any = await socialArtDB.query(
        getUsersTokenDevices
      );      

      usersTokenDevices?.map((token) => {
        sendNotification(token?.deviceToken, title, body);
      });

      console.log("Send Notification Api Fullfilled");
      return ApiResponse.successResponse(res, "Notification Sent Successfully");
    } catch (error) {
      console.log("Send Notification Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },
};

export default NotificationController;
