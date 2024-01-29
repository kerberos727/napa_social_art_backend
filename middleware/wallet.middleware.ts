import WAValidator from "multicoin-address-validator";
import apiResponse from "../utils/api-response";

const walletValidator = (req, res, next) => {
  const id = req?.body?.accountId;
  
  const validate = WAValidator.validate(id, "ZRX");
  if (validate) {
    next();
  } else {
    return apiResponse.validationErrorWithData(res, "Wallet address invalid");
  }
};

export default walletValidator;
