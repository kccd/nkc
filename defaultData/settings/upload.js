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
    blackExtensions: [],
    whiteExtensions: [],
    sizeLimit: [
      {
        extension: 'mp4',
        size: 200 * 1024
      }
    ],
    watermark: {
      disabled: false,
      transparent: 30,
      fileId: ''
    }
  }
};
