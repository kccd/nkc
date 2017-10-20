const parameter = Symbol('parameter');
const certificates ={
  visitor: {
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
        [parameter]: {
          GET: true
        }
      },
      editor: {
        displayName: '编辑器',
        GET: true
      },
      t: {
        displayName: '贴子',
        [parameter]: {
          GET: true
        }
      },
      f: {
        displayName: '板块',
        GET: true,
        [parameter]: {
          GET: true
        }
      },
      u: {
        displayName: '用户',
        [parameter]: {
          GET: true
        }
      },
      m: {
        displayName: '专栏',
        [parameter]: {
          GET: true
        }
      },
      search: {
        displayName: '搜索',
        GET: true,
        POST: true,
      },
      exam: {
        displayName: '考试',
        [parameter]: {
          GET: true,
          POST: true,
        }
      },
      register: {
        displayName: '注册',
        [parameter]: {
          GET: true,
          POST: true,
        }
      },
      r: {
        displayName: '附件',
        [parameter]: {
          GET: true,
          nextIsParam: true}
        },
      rt: {
        displayName: '附件',
        [parameter]: {
          GET: true
        }
      },
      p: {
        displayName: '推文',
        [parameter]: {
          GET: true,
        }
      }
    }
  },

  default: {
    displayName: '会员',
    inheritFrom: ['visitor'],
    contentClasses: {
      images: true,
      non_public: true,
      non_images: true,
      non_broadcast: true
    },
    permittedOperations: {
      f: {
        [parameter]: {
          POST: true,
        }
      },
      sms: {
        displayName: '信息',
        GET: true,
        POST: true,
        nextIsParam: true,
        at: {
          GET: true
        },
        replies: {
          GET: true
        },
        message: {
          GET: true,
          nextIsParam: true,
          POST: true
        },
        system: {
          GET: true
        }
      },
    }
  }
};

module.exports = {
  calculateThenConcatCerts: (user) => {
    if(!user)return ['visitor'];
    if(!user.certs){
      user.certs =  []
    }
    let certs = ['default'].concat(user.certs)
    //-----------------------below are calculated permissions
    if(user.xsf > 0){
      certs.push('scholar')
    }
    return certs
  },
  getDisplayNameOfCert: (cert) => {
  return (certificates[cert]?certificates[cert].display_name:'');
  }
};