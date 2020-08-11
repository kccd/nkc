module.exports = {
  _id: 'download',
  c: {
    options: [
       {
        id: 'default',
        type: "role",
        fileCountOneDay: 3,
        speed: 1024, // KB
      },
      {
        id: 'visitor',
        type: "role",
        fileCountOneDay: 3,
        speed: 1024, // KB
      }
    ]
  }
};
