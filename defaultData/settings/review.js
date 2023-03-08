const {settingIds} = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.review,
  c: {
    certsId: [],
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
            gradeId: 0,
            status: false,
            type: "all",
            count: 10
          },
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
            gradeId: 0,
            status: false,
            type: "all",
            count: 10
          },
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
          }
        ]
      },
      // 特殊限制
      special: {
        whitelistUid: [],
        blacklistUid: []
      }
    },
    keyword: {
      enable: false,
      wordGroup: [],
      condition: {
        leastKeywordTimes: 1,
        leastKeywordCount: 1,
        relationship: "or"
      },
    },
    username: {
      keyword: {
        enable: false,
        desc: '用户名包含敏感词',
        groupIds: []
      }
    },
    userDesc: {
      keyword: {
        enable: false,
        desc: '用户简介包含敏感词',
        groupIds: []
      }
    },
    columnName: {
      keyword: {
        enable: false,
        desc: '专栏名称包含敏感词',
        groupIds: []
      }
    },
    columnDesc: {
      keyword: {
        enable: false,
        desc: '专栏简介包含敏感词',
        groupIds: []
      }
    }
  }
};
