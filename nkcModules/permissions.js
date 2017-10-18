const visitor = {
  displayName: '陆游',
  contentClasses: {
    null: true,
    images: true,
    non_public: false,
    non_images: false
  },
  permittedOperations: {
    GET: true,
    login: {
      displayName: '登录',
      GET: true,
      POST: true,
      DELETE: true
    },
    latest: {
      displayName: '最近',
      GET: true
    },
    activities: {
      displayName: '动态',
      GET: true,
      nextIsParam: true
    },
    editor: {
      displayName: '编辑器',
      GET: true
    },
    t: {
      displayName: '贴子',
      GET: true,
      POST: true,
      nextIsParam: true,
      digest: {
        displayName: '精华',
        GET: true,
        DELETE: true,
      }
    },
    f: {
      displayName: '板块',
      GET: true,
      nextIsParam: true
    },
    u: {
      displayName: '用户',
      GET: true,
      nextIsParam: true,
      favorite: {
        displayName: '收藏',
        GET: true,
        POST: true,
        DELETE: true
      }
    },
    m: {
      displayName: '专栏',
      GET: true,
      nextIsParam: true
    },
    search: {
      displayName: '搜索',
      GET: true,
      POST: true,
    },
    exam: {
      displayName: '考试',
      GET: true,
      POST: true,
      nextIsParam: true,
    },
    register: {
      displayName: '注册',
      GET: true,
      POST: true,
      nextIsParam: true
    }

  }
};