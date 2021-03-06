const FlowError = require('./FlowError').FlowError;

module.exports.errorHandlingMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof FlowError) {
      ctx.status = err.code;
      ctx.body = { message: err.message };
    } else {
      console.log(err);
      ctx.status = 500;
      ctx.body = { message: 'Unknown Error.' };
    }
  }
};
