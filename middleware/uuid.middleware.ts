import Apiresponse from "../utils/api-response";

const uuidValidator = (req, res, next) => {
  const { id } = req.params;
  const uuid = req?.body?.whitelist?.profileId || id;
  if (uuid.length != 36) {
    return next();
  }
  const uuidRegexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  const validate = uuidRegexExp.test(uuid);
  if (validate) {
    next();
  } else {
    return Apiresponse.validationErrorWithData(res, "UUID Invalid");
  }
};

export default uuidValidator;
