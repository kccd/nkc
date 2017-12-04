const parameter = Symbol('parameter');
const GET = Symbol('GET');
const POST = Symbol('POST');
const DELETE = Symbol('DELETE');
const PATCH = Symbol('PATCH');
const OPTIONS = Symbol('OPTIONS');
const PUT = Symbol('PUT');
const name = Symbol('name');

const _hour = 3600*1000;
const _day = _hour*24;
const _month = _day*30;
const _year = _month*12;

const methodEnum = {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS
};

const certificates ={
  visitor: {
    displayName: '陆游',
    inheritFrom: ['banned'],
    contentClasses: {
      null: true,
      images: true,
      non_public: false,
      non_images: false
    },
    permittedOperations: {
      login: {
        [name]: '登录',
        [GET]: true,
        [POST]: true,
        [DELETE]: true
      },
      latest: {
        [name]: '最近帖子',
        [GET]: true
      },
      pfa: {
        [name]: '个人版头像',
        [parameter]: {
          [GET]: true
        }
      },
      pfb: {
        [name]: '个人版banner',
        [parameter]: {
          [GET]: true
        }
      },
      activities: {
        [name]: '个人动态',
        [parameter]: {
          [GET]: true
        }
      },
      t: {
        [name]: '贴子',
        [parameter]: {
          [GET]: true
        }
      },
      f: {
        [name]: '板块',
        [GET]: true,
        [parameter]: {
          [GET]: true,
          c: {
            [name]: '标签',
            [GET]: true,
            [parameter]: {
              [GET]: true
            }
          }
        }
      },
      u: {
        [name]: '用户',
        [parameter]: {
          [GET]: true
        }
      },
      m: {
        [name]: '专栏',
        [parameter]: {
          [GET]: true
        }
      },
      search: {
        [name]: '搜索',
        [GET]: true,
        [POST]: true,
      },
      exam: {
        [name]: '考试',
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [POST]: true,
        }
      },
      register: {
        [name]: '注册',
        [GET]: true,
        email: {
          [GET]: true,
          [POST]: true,
          verify: {
            [GET]: true
          }
        },
        mobile: {
          [GET]: true,
          [POST]: true
        }
      },
      r: {
        [name]: '附件',
        [parameter]: {
          [GET]: true,
        }
      },
      rt: {
        [name]: '附件',
        [parameter]: {
          [GET]: true
        }
      },
      p: {
        [name]: '推文',
        [parameter]: {
          [GET]: true,
        }
      },
      sendMessage: {
        [name]: '发短信',
        register: {
          [name]: '注册短信',
          [POST]: true
        },
        bindMobile: {
          [name]: '绑定手机号',
          [POST]: true
        },
        reset: {
          [name]: '找回密码',
          [POST]: true
        }
      },
      avatar: {
        [parameter]: {
          [GET]: true
        },
        [GET]: true
      },
      avatar_small: {
        [parameter]: {
          [GET]: true
        },
        [GET]: true
      },
      resources: {
        site_specific: {
          forum_icon: {
            [parameter]: {
              [GET]: true,
            },
          },
          [parameter]: {
            [GET]: true
          }
        },
      },
      default: {
        [parameter]: {
          [GET]: true
        },
        [GET]: true
      },
      forgotPassword: {
        [name]: '找回密码',
        [GET]: true,
        mobile: {
          [name]: '通过手机号找回',
          [GET]: true,
          [POST]: true,
          [PUT]: true
        },
        email: {
          [name]: '通过邮箱找回',
          [GET]: true,
          [POST]: true,
          [PUT]: true,
          verify: {
            [name]: "验证邮件",
            [GET]: true
          }
        }
      }
    },
    elseModifyTimeLimit: 0,
    selfModifyTimeLimit: 0
  },
  banned: {
    displayName: '开除学籍',
    permittedOperations: {
      me: {
        [GET]: true
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
      m: {
        [parameter]: {
          config: {
            [name]: '个人板块信息',
            [PATCH]: true
          }
        }
      },
      f: {
        [parameter]: {
          [POST]: true,
          subscribe: {
            [POST]: true,
            [DELETE]: true
          },
          category: {
            [name]: '分类',
            [GET]: true
          }
        }
      },
      sms: {
        [name]: '信息',
        [GET]: true,
        at: {
          [name]: '@',
          [GET]: true
        },
        replies: {
          [name]: '回复',
          [GET]: true
        },
        message: {
          [name]: '消息',
          [GET]: true,
          [POST]: true,
          [parameter]: {
            [GET]: true
          }
        },
        system: {
          [name]: '系统',
          [GET]: true,
          [parameter]: {
            [GET]: true
          }
        }
      },
      t: {
        [parameter]: {
          [POST]: true,
          addColl: {
            [name]: '收藏',
            [POST]: true
          },
          switchInPersonalForum: {
            [name]: '在专栏加精、顶置、隐藏显示',
            [PATCH]: true
          }
        }
      },
      r: {
        [POST]: true,
        [GET]: true,
        personalForumAvatar: {
          [POST]: true
        },
        personalForumBanner: {
          [POST]: true
        }
      },
      editor: {
        [name]: '编辑器',
        [GET]: true
      },
      p: {
        [parameter]: {
          [PATCH]: true,
          recommend: {
            [name]: '推荐',
            [POST]: true,
            [DELETE]: true
          },
          quote: {
            [name]: '引用',
            [GET]: true
          }
        }
      },
      u: {
        [GET]: true, // 查看用户资料
        [parameter]: {
          subscribe: {
            [name]: '订阅',
            [GET]: true,
            [POST]: true, // 订阅该用户
            [DELETE]: true // 取消订阅该用户
          },
          collections: {
            [name]: '收藏',
            [GET]: true,
            [POST]: true,
            [DELETE]: true,
            [PUT]: true,
            [parameter]: {
              [GET]: true,
              [PATCH]: true,
              [DELETE]: true
            }
          }
        }
      },
      me: {
        [PATCH]: true,
        [GET]: true,
        personalsetting: {
          [name]: '个人信息',
          [PATCH]: true
        },
        password: {
          [name]: '密码',
          [PATCH]: true
        },
        username: {
          [name]: '用户名',
          [PATCH]: true
        },
        mobile: {
          [name]: '手机',
          [POST]: true
        },
        resource: {
          [name]: '上传的资源',
          [GET]: true
        }
      },
      logout: {
        [GET]: true
      }
    },
    elseModifyTimeLimit: 0,
    selfModifyTimeLimit: 0.5*_hour
  },
  email: {
    displayName: '笔友',
    inheritFrom: ['default'],
    permittedOperations: {
      p: {
        [parameter]: {
          quote: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: _hour
  },
  mobile: {
    displayName: '机友',
    inheritFrom: ['default'],
    permittedOperations: {
      p: {
        [parameter]: {
          quote: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: _hour
  },
  examinated: {
    displayName: '进士',
    inheritFrom: ['default'],
    contentClasses: {
      professional: true
    },
    permittedOperations: {
      [GET]: true,
      p: {
        [parameter]: {
          quote: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: 3*_month
  },
  qc: {
    displayName: '题委',
    permittedOperations: {
      q: {
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [POST]: true,
          [parameter]: {
            [GET]: true
          }
        }
      }
    }
  },
  scholar: {
    displayName: '学者',
    inheritFrom: ['examinated', 'qc'],
    contentClasses: {
      sensitive: true
    },
    permittedOperations: {
      p: {
        [parameter]: {
          history: {
            [GET]: true
          }
        }
      }
    },
    selfModifyTimeLimit: 3*_year
  },
  moderator: {
    displayName: '版主',
    inheritFrom: ['scholar'],
    contentClasses: {
      classified: true
    },
    permittedOperations: {
      e: {
        [name]: '管理页面',
        [GET]: true,
        behavior: {
          [name]: '行为日志',
          [GET]: true
        },
        newUsers: {
          [name]: '新注册用户',
          [GET]: true
        },
        stats: {
          [name]: '统计',
          [GET]: true
        },
      },
      u: {
        [parameter]: {
          [DELETE]: true, // 封禁用户
          [PUT]: true // 解封用户
        }
      },
      t: {
        [parameter]: {
          digest: {
            [name]: '精华',
            [PATCH]: true
          },
          topped: {
            [name]: '顶置',
            [PATCH]: true,
            [POST]: true
          },
          moveThread: {
            [name]: '移动贴子',
            [PATCH]: true
          },
          [PATCH]: true
        },
      },
      p: {
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [PATCH]: true,
          credit: {
            [name]: '学术分',
            [PATCH]: true
          },
          disabled: {
            [name]: '屏蔽',
            [PATCH]: true
          }
        }
      },
    },
    elseModifyTimeLimit: 20*_year,
    selfModifyTimeLimit: 20*_year
  },
  senior_moderator: {
    displayName: '责任版主',
    inheritFrom: ['moderator'],
  },
  editor: {
    displayName: '编辑',
    inheritFrom: ['senior_moderator'],
    contentClasses: {
      administractive: true
    },
    permittedOperations: {
      q: {
        [parameter]: {
          [parameter]: {
            [PATCH]: true,
            [DELETE]: true
          }
        }
      },
      m: {
        [parameter]: {
          pop: {
            [name]: '专栏推荐',
            [POST]: true,
            [DELETE]: true
          },
        }
      },
      t: {
        [parameter]: {
          ad: {
            [name]: '首页置顶',
            [PATCH]: true
          }
        }
      },
      f: {
        [parameter]: {
          [PATCH]: true,
          category: {
            [name]: '帖子分类',
            [POST]: true,
            [PATCH]: true,
            [parameter]: {
              [name]: 'cid',
              [DELETE]: true
            }
          }

        }
      }
    }
  },
  dev: {
    displayName: '运维',
    inheritFrom: ['editor'],
    permittedOperations: {
      e: {
        newSysinfo: {
          [name]: '系统通知',
          [GET]: true,
          [POST]: true
        },
        updateAllUsers: {
          [name]: '更新所有用户数据',
          [POST]: true
        },
        updateAllForums: {
          [name]: '更新所有板块数据',
          [POST]: true
        },
        updateAllThreads: {
          [name]: '更新所有帖子数据',
          [POST]: true
        }
      }
    }
  }
};

module.exports = {
  methodEnum,
  time: {
    _hour,
    _day,
    _month,
    _year
  },
  certificates,
  parameter,
  name
};