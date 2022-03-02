module.exports = {
  _id: 'documentPost',
  c: {
    article: {
      postPermission: {
        authLevelMin: 0,
        examVolumeA: true,
        examVolumeB: true,
        examNotPass: {
          status: true,
          limited: false,
          count: 1
        },
        defaultInterval: {
          limited: false,
          interval: 1
        },
        defaultCount: {
          limited: false,
          count: 1
        },
        intervalLimit: [
          {
            id: 'role-dev',
            limited: false,
            interval: 1
          },
          {
            id: 'grade-0',
            limited: true,
            interval: 1
          }
        ],
        countLimit: [
          {
            id: 'role-dev',
            limited: false,
            count: 1
          },
          {
            id: 'grade-0',
            limited: true,
            count: 100
          }
        ]
      },
      postReview: {
        whitelist: ['role-dev'],
        notPassVolumeA: {
          type: 'none',
          count: 1
        },
        foreign: {
          nationCode: '86',
          type: 'none',
          count: 1
        },
        blacklist: [
          {
            id: 'role-dev',
            type: 'none',
            count: 1
          },
          {
            id: 'grade-1',
            type: 'count',
            count: 10
          },
          {
            id: 'grade-0',
            type: 'all',
            count: 1
          }
        ],
        keywordGroupId: []
      }
    },
    comment: {
      postPermission: {
        authLevelMin: 0,
        examVolumeA: true,
        examVolumeB: true,
        examNotPass: {
          status: true,
          limited: false,
          count: 1
        },
        defaultInterval: {
          limited: false,
          interval: 1
        },
        defaultCount: {
          limited: false,
          count: 1
        },
        intervalLimit: [
          {
            id: 'role-dev',
            limited: false,
            interval: 1
          },
          {
            id: 'grade-0',
            limited: true,
            interval: 1
          }
        ],
        countLimit: [
          {
            id: 'role-dev',
            limited: false,
            count: 1
          },
          {
            id: 'grade-0',
            limited: true,
            count: 100
          }
        ]
      },
      postReview: {
        whitelist: ['role-dev'],
        notPassVolumeA: {
          type: 'none',
          count: 1
        },
        foreign: {
          nationCode: '86',
          type: 'none',
          count: 1
        },
        blacklist: [
          {
            id: 'role-dev',
            type: 'none',
            count: 1
          },
          {
            id: 'grade-1',
            type: 'count',
            count: 10
          },
          {
            id: 'grade-0',
            type: 'all',
            count: 1
          }
        ],
        keywordGroupId: []
      }
    },
    moment: {
      postPermission: {
        authLevelMin: 0,
        examVolumeA: true,
        examVolumeB: true,
        examNotPass: {
          status: true,
          limited: false,
          count: 1
        },
        defaultInterval: {
          limited: false,
          interval: 1
        },
        defaultCount: {
          limited: false,
          count: 1
        },
        intervalLimit: [
          {
            id: 'role-dev',
            limited: false,
            interval: 1
          },
          {
            id: 'grade-0',
            limited: true,
            interval: 1
          }
        ],
        countLimit: [
          {
            id: 'role-dev',
            limited: false,
            count: 1
          },
          {
            id: 'grade-0',
            limited: true,
            count: 100
          }
        ]
      },
      postReview: {
        whitelist: ['role-dev'],
        notPassVolumeA: {
          type: 'none',
          count: 1
        },
        foreign: {
          nationCode: '86',
          type: 'none',
          count: 1
        },
        blacklist: [
          {
            id: 'role-dev',
            type: 'none',
            count: 1
          },
          {
            id: 'grade-1',
            type: 'count',
            count: 10
          },
          {
            id: 'grade-0',
            type: 'all',
            count: 1
          }
        ],
        keywordGroupId: []
      }
    },
  }
}
