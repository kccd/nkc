module.exports = {
  _id: "upload",
  c: {
    options: [
      {
        type: 'role',
        id: 'default',
        fileCountOneDay: '200',
        blackExtensions: []
      }
    ],
    watermark: {
      transparent: 30,
      
    }
  }
};
