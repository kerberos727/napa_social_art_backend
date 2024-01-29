import Validator from "validatorjs";

const Validate = {
  validator: async (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
  },
};

export default Validate;
