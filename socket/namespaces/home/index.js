
const func = (io) => {
  io.on("connection", async (socket) => {
    const {data, db} = socket.NKC;
    const {user} = data;
    console.log(`访问 home socket , ${user? user.username: "visitor"}`);
    if(!user) return socket.disconnect(true);
  });
};
module.exports = func;