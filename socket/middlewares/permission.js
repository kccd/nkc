module.exports = async (socket, next) => {
  const {query, data, util} = socket.NKC;
  if(!query.operationId || !data.userOperationsId.includes(query.operationId)) {
    return await util.connect.disconnectSocket(socket);
  }
  await next();
}
