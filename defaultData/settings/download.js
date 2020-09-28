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
    ],

    allSpeed: 100 * 1024, //总下载速度 KB

    speed: {
      default: {
        fileCount: 10,
        data: [
          {
            startingTime: 0,
            endTime: 24,
            speed: 1024
          }
        ]
      },
      others: [
        {
          type: 'role-visitor',
          fileCount: 3,
          data: [
            {
              startingTime: 0,
              endTime: 24,
              speed: 1024
            }
          ]
        },
        {
          type: 'role-banned',
          fileCount: 0,
          data: [
            {
              startingTime: 0,
              endTime: 24,
              speed: 0
            }
          ]
        }
      ]
    },
  }
};
