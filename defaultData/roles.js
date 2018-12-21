module.exports = [
  {
    _id: 'dev',
    color: '#000000',
    description: '管理人员，拥有至高无上的权利',
    abbr: '运',
    displayName: '运维',
    contentClass: [],
    modifyPostTimeLimit: -1,
    defaultRole: true,
    operationsId: []
  },
  {
    _id: 'default',
    color: '#234233',
    description: '普通用户',
    abbr: '普',
    displayName: '普通用户',
    contentClass: [],
    modifyPostTimeLimit: 0.5,
    defaultRole: true,
    operationsId: [
      'logout'
    ]
  },
  {
    _id: 'banned',
    color: '#a23422',
    description: '被封禁的用户',
    abbr: '禁',
    displayName: '被封用户',
    contentClass: [],
    modifyPostTimeLimit: 0,
    defaultRole: true,
    operationsId: []
  },
  {
    _id: 'visitor',
    color: '#a23422',
    description: '未登录用户',
    abbr: '游',
    displayName: '游客',
    contentClass: [],
    modifyPostTimeLimit: 0,
    defaultRole: true,
    operationsId: [
      'visitLogin',
      'submitLogin',
      'visitHome',
      'getUserAvatar'
    ]
  },
  {
    _id: 'moderator',
    color: '#aaaaaa',
    description: '专家',
    abbr: '专',
    displayName: '专家',
    contentClass: [],
    modifyPostTimeLimit: 0,
    defaultRole: true,
    operationsId: []
  }
];