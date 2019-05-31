module.exports = {
  _id: "review",
  c: {
    thread: {
      whitelist: {
        gradesId: [],
        certsId: []
      },
      blacklist: {
        foreign: {
          status: false,
          type: "all", // all, some
          count: 10
        },
        notPassedA: {
          status: true,
          type: "all",
          count: 10
        },
        grades: [
          {
            gradeId: 1,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 2,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 3,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 4,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 5,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 6,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 7,
            status: false,
            type: "all",
            count: 10
          }
        ]
      },
      // 特殊限制
      special: {
        whitelistUid: [],
        blacklistUid: []
      }
    },
    post: {
      whitelist: {
        gradesId: [],
        certsId: []
      },
      blacklist: {
        foreign: {
          status: false,
          type: "all", // all, some
          count: 10
        },
        notPassedA: {
          status: true,
          type: "all",
          count: 10
        },
        grades: [
          {
            gradeId: 1,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 2,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 3,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 4,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 5,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 6,
            status: false,
            type: "all",
            count: 10
          },
          {
            gradeId: 7,
            status: false,
            type: "all",
            count: 10
          }
        ]
      },
      // 特殊限制
      special: {
        whitelistUid: [],
        blacklistUid: []
      }
    }

  }
};