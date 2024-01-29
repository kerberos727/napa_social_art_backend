import ApiResponse from "../utils/api-response";
import UserGenreTable from "../models/user-genre-table";

const UserGenreTableController = {
  create: async (req, res) => {
    try {
      console.log("Create New User Genre Api Pending");
      const newGenre = new UserGenreTable(req.body);

      const [genre] = await UserGenreTable.getGenre(req.body.profileId);
      // @ts-ignore
      if (genre.length) {
        return ApiResponse.successResponse(
          res,
          "User genre updated successfuly"
        );
      }

      const [genreData] = await newGenre.create();

      console.log("Create New User Genre Api Fullfilled");

      return ApiResponse.successResponseWithData(
        res,
        "User Genre Created Successfully",
        genreData[0]
      );
    } catch (error) {
      console.log("Create New User Genre Api Rejected");
      console.error(error);
      return ApiResponse.ErrorResponse(res, error.message);
    }
  },

  getAllGenres: async (req, res) => {
    try {
      console.log("Get All User Genres Pending");
      const [genres] = await UserGenreTable.getAllGenres();
      // @ts-ignore
      if (!genres.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "User Genres Data Not Found"
        );
      }
      console.log("Get All User Genres Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get All User Genres Successfully",
        // @ts-ignore
        genres.length ? genres : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get All User Genres Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Get All User Genres");
    }
  },

  getGenre: async (req, res) => {
    try {
      console.log("Get User Genre Pending");
      const { profileId } = req.query;
      const [genre] = await UserGenreTable.getGenre(profileId);
      // @ts-ignore
      if (!genre.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "User Genre Data Not Found"
        );
      }
      console.log("Get User Genre Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Get User Genre Successfully",
        // @ts-ignore
        genre.length ? genre[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Get User Genre Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Get User Genre");
    }
  },

  updateGenre: async (req, res) => {
    try {
      console.log("Update User Genre Pending");
      const { profileId, genereSelected } = req.query;
      const [genre] = await UserGenreTable.getGenre(profileId);
      // @ts-ignore
      if (!genre.length) {
        return ApiResponse.validationErrorWithData(
          res,
          "User Genre Data Not Found"
        );
      }
      const [genreData] = await UserGenreTable.updateGenre(profileId, genereSelected);
      console.log("Update User Genre Successfully");
      return ApiResponse.successResponseWithData(
        res,
        "Update User Genre Successfully",
        // @ts-ignore
        genreData.length ? genreData[0] : null
      );
    } catch (error) {
      console.log(error);
      console.log("Update User Genre Rejected");
      return ApiResponse.ErrorResponse(res, "Unable to Update User Genre");
    }
  },
};

export default UserGenreTableController;
