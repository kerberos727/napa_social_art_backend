import { Validate } from "../utils/index.utils";
import response from "../utils/api-response";

const typeValidation = (validationRule) => {
  return async (req, res, next) => {
    await Validate.validator(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        return response.validationRuleResponse(
          res,
          "Please enter a valid type",
          err
        );
      } else {
        next();
      }
    }).catch((err) => {
      console.log("err", err);
    });
  };
};

export default typeValidation;
