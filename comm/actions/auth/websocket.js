module.exports = {
  params: {
    cookie: 'string',
    operationId: 'string',
    os: 'string'
  },
  handler(ctx) {
    const {cookie, operationId, os} = ctx.params;
    console.log({
      cookie, operationId, os
    });
  }
};
