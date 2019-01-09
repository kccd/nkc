module.exports = async (namespace, roomName) => {
  return new Promise((resolve, reject) => {
    namespace.adapter.clients([roomName], (err, clients) => {
      if(err) return reject(err);
      resolve(clients);
    })
  });
};