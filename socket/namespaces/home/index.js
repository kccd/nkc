
const func = (io) => {
  io.on("connection", async (socket) => {
    console.log(`home socket connected, id: ${socket.id}`);
  });
};
module.exports = func;