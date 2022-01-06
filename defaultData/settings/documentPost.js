module.exports = {
  _id: 'documentPost',
  c: {
    article: {
      postPermission: {
        authLevelMin: 0,
        examVolumeA: true,
        examVolumeB: true,
        examNotPass: `true:false:0`, // 未通过考试是否允许发表:是否限制条数:限制的条数
        defaultInterval: `false:0`, // 是否限制发表间隔:限制时的最小间隔
        defaultCount: `false:0`, // 是否限制每天发表数量:限制时的最小条数
        intervalLimit: [
          'role:dev:false:0',
          'grade:0:true:100'
        ],
        countLimit: [
          'role:dev:false:0',
          'grade:0:true:100'
        ]
      },
      postReview: {
        default: `none:0`, // 是否需要审核:是否限制审核条数:限制审核时的具体条数 none: 无需审核, all: 全审, count: 具体审核多少
        list: [
          'role:dev:none:1',
          'role:eng:none:1',
          'grade:1:count:10',
          'grade:0:all:1'
        ]
      }
    }
  }
}