module.exports = async (namespace, roomName) => {
  const socketsID = await namespace.adapter.sockets(new Set([roomName]));
  return [...socketsID];
};
