const _ = require("lodash");

const validator =
  (schema, source = "body") =>
  async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req[source]);
      if (source === "body") {
        req._body = req?.body; // for debugging purposes
        req.body = value; // validated value
      }
      if (source === "query") {
        req._query = req?.query; // for debugging purposes
        req.query = value; // validated value
      }

      return next();
    } catch (error) {
      const { type, message } = { ...error.details[0] };

      const isPatternError =
        type === "string.pattern.base" || type.startsWith("string.pattern");

      if (isPatternError) {
        // const shownError = 'Custom message for pattern errors';
        // // This helps to the actual error message
        // logger.error('', { shownError, error });
        // return res.status(400).send({
        //   success: false,
        //   message: shownError
        // });
      }

      return res.status(400).send({
        success: false,
        // remove double quotes and escape characters from the message, e.g. \"username\" => Username
        message: _.capitalize(message.replaceAll('"', "")),
      });
    }
  };

module.exports = validator;
