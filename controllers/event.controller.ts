import { Event } from "../models/index.models";
import ApiResponse from "../utils/api-response";

const EventController = {
  getAllEvents: async (req, res) => {
    try {
      console.log("Get All Events Pending");
      const [events] = await Event.getAllEvents("1");
      // @ts-ignore
      if (!events.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Events Data Not Found"
        );
      }
      console.log("Get All Events Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get All Events Successfully",
        // @ts-ignore
        events.length ? events : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get All Events Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch events");
    }
  },

  getEvent: async (req, res) => {
    try {
      console.log("Get Event Api Pending");
      const { eventId } = req.params;
      const [events] = await Event.getEvent(eventId);
      // @ts-ignore
      if (!events.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "Event Data Not Found"
        );
      }
      console.log("Get Event Api Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get Event Api Successfully",
        // @ts-ignore
        events.length ? events[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get Event Api Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to fetch events");
    }
  },
};

export default EventController;
