module.exports = [
  {
    fid: '1',
    displayName: '管理',
    abbr: '管理',
    description: '系统管理',
    brief: '系统管理',
    accessible: true,
    displayOnParent: true,
    visibility: true,
    isVisibleForNCC: true,
    permission: {
      write: {
        rolesId: ['dev', 'default', 'visitor'],
      },
      read: {
        rolesId: ['dev', 'default', 'visitor'],
      }
    },
    type: 'category'
  },
  {
    fid: '2',
    displayName: '通知',
    abbr: '通知',
    description: '系统通知',
    brief: '系统通知',
    accessible: true,
    displayOnParent: true,
    visibility: true,
    isVisibleForNCC: true,
    permission: {
      write: {
        rolesId: ['dev', 'default', 'visitor'],
      },
      read: {
        rolesId: ['dev', 'default', 'visitor'],
      }
    },
    type: 'forum',
    parentsId: [1]
  },
  {
    fid: 'recycle',
    displayName: '回收站',
    abbr: '回收站',
    description: '系统回收站',
    brief: '系统回收站',
    accessible: true,
    displayOnParent: true,
    visibility: true,
    isVisibleForNCC: false,
    permission: {
      write: {
        rolesId: ['dev'],
      },
      read: {
        rolesId: ['dev'],
      }
    },
    type: 'forum',
    parentsId: [1]
  }
];
