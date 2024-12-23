async function bindOperation(operation) {
  return async (ctx, next) => {
    this.state.operationId = operation;
    await next();
  };
}

module.exports = {
  bindOperation,
};
