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

const mongoose = require('../settings').database;
const {Map} = require('immutable');

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
        [name]: '最近',
        [GET]: true
      },
      activities: {
        [name]: '动态',
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
        [parameter]: {
          [GET]: true,
          [POST]: true,
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
      f: {
        [parameter]: {
          [POST]: true,
          subscribe: {
            [POST]: true,
            [DELETE]: true
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
          topInPF: {
            [name]: '专栏置顶',
            [POST]: true,
            [DELETE]: true
          },
          digestInPF: {
            [name]: '专栏加精',
            [POST]: true,
            [DELETE]: true
          },
          invisibleInPF: {
            [name]: '专栏隐藏',
            [POST]: true,
            [DELETE]: true
          }
        }
      },
      r: {
        [POST]: true,
        [GET]: true
      },
      editor: {
        [name]: '编辑器',
        [GET]: true
      },
      p: {
        [parameter]: {
          [PUT]: true,
          recommend: {
            [name]: '推荐',
            [POST]: true,
            [DELETE]: true
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
        [PUT]: true,
        [GET]: true,
        personalsetting: {
          [name]: '个人信息',
          [PUT]: true
        },
        password: {
          [name]: '密码',
          [PUT]: true
        },
        username: {
          [name]: '用户名',
          [PUT]: true
        },
        mobile: {
          [name]: '手机',
          [PUT]: true
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
  mail: {
    displayName: '笔友',
    inheritFrom: ['default'],
    permittedOperations: {
      p: {
        [parameter]: {
          quote: {
            [POST]: true
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
            [POST]: true
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
      p: {
        [parameter]: {
          quote: {
            [POST]: true
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
        cart: {
          [name]: '管理车',
          [GET]: true,
          [POST]: true
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
            [POST]: true,
            [DELETE]: true
          },
          topped: {
            [name]: '精华',
            [POST]: true,
            [DELETE]: true
          },
          [PATCH]: true
        },
      },
      p: {
        [GET]: true,
        [parameter]: {
          [GET]: true,
          [DELETE]: true, //屏蔽post
          [POST]: true, // 解封post
          credit: {
            [name]: '学术分',
            [PUT]: true
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
    inheritFrom: ['senior_moderator', 'qc'],
    contentClasses: {
      administractive: true
    },
    permittedOperations: {
      q: {
        [parameter]: {
          [parameter]: {
            [PUT]: true,
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
            [POST]: true,
            [DELETE]: true
          }
        }
      },
      f: {
        [parameter]: {
          forUsers: {
            [name]: '对用户可见',
            [DELETE]: true, // 对用户可见
            [PUT]: true // 对用户不可见
          },
          forUsersByCerts: {
            [name]: '无权可见',
            [DELETE]: true, // 无权不可见
            [PUT]: true // 无权可见
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
        }
      }
    }
  }
};

function filterKeys(e) {
  return e !== 'inheritFrom' && e !== 'displayName'
}

function deepCopy(obj) {
  const result = {};
  for(let cert of Object.keys(obj).filter(filterKeys)) {
    const val = obj[cert];
    if(val instanceof Object) {
      result[cert] = deepCopy(val)
    } else {
      result[cert] = val
    }
  }
  for(let key of Object.getOwnPropertySymbols(obj)) {
    const val = obj[key];
    if(val instanceof Object) {
      result[key] = deepCopy(val)
    } else {
      result[key] = val
    }
  }
  return result
}

function mergeTree(originalTree, treeToBeMerged) {
  const t1 = originalTree;
  const t2 = treeToBeMerged;
  const newTree = deepCopy(t1);
  for(let cert of Object.keys(t2).filter(filterKeys)) {
    const v2 = t2[cert];
    if(newTree[cert]) {
      if(newTree[cert] instanceof Object) {
        newTree[cert] = mergeTree(newTree[cert], v2)
      } else {
        newTree[cert] = Math.max(v2, newTree[cert])
      }
    } else {
      if(v2 instanceof Object) {
        newTree[cert] = deepCopy(v2)
      } else {
        newTree[cert] = v2
      }
    }
  }
  for(let key of Object.getOwnPropertySymbols(t2)) {
    const v2 = t2[key];
    if(newTree[key]) {
      if(newTree[key] instanceof Object) {
        newTree[key] = mergeTree(newTree[key], v2)
      } else {
        newTree[key] = Math.max(v2, newTree[key])
      }
    } else {
      if(v2 instanceof Object) {
        newTree[key] = deepCopy(v2)
      } else {
        newTree[key] = v2
      }
    }
  }
  return newTree
}

function getPermitTree(certs) {
  let tree = {};
  for(const cert of certs) {
    let certificate = certificates[cert];
    if(certificate.inheritFrom)
      tree = getPermitTree(certificate.inheritFrom);
    tree = mergeTree(tree, certificate)
  }
  return tree
}

function getVisibleFid() {
  const cc = this.data.certificates.contentClasses;
  return mongoose.connection.db.collection('forums').aggregate([
    {$match: {class: {$in: cc}}},
    {$replaceRoot: {newRoot: '$fid'}}
  ])
}

module.exports = async (ctx, next) => {
  let certs = ['visitor'];
  ctx.getUserDescription = function(user = this.data.user) {
    const {certs, username, xsf = 0, kcb = 0} = user;
    let cs = ['会员'];
    for(const cert of certs) {
      cs.push(certificates[cert].displayName);
    }
    cs = cs.join(' ');
    return {
      string: `${username}\n`+
      `学术分 ${xsf}\n`+
      `科创币 ${kcb}\n`+
      `${cs}`,
      certs: cs
    }
  }.bind(ctx);
  if(ctx.data.user) {
    certs = ctx.data.user.certs;
    ctx.data.user.navbarDesc = ctx.getUserDescription();
  }
  const cs = getPermitTree(certs);
  cs.contentClasses = Object.keys(cs.contentClasses);
  ctx.data.certificates = cs;

  ctx.data.methodEnum = methodEnum;
  ctx.data.parameter = parameter;
  ctx.data.ensurePermission = function(method = this.method, path = this.path) {
    let obj = this.data.certificates.permittedOperations;
    const m = methodEnum[method];
    const routes = path.match(/\/([^\/]*)/g)
      .map(e => e.replace('/', ''))
      .filter(e => e !== '');
    if(routes.length === 0)
      return true;
    for(const route of routes) {
      if(obj[route]) {
        obj = obj[route]
      }
      else if(obj[parameter]) {
        obj = obj[parameter]
      }
      else {
        return false
      }
    }
    return obj[m]
  }.bind(ctx);
  ctx.getVisibleFid = getVisibleFid;
  ctx.generateMatchBase = (base = {}) => {
    if(!this.ensurePermission('POST', '/t/x/digest'))
      //if someone wasn't able to modify a thread, then he wasn't able to view
      //threads or posts which were disabled.
      base.disabled = false;
    return Map(base)
  };
  if(!ctx.data.ensurePermission())
    ctx.throw(401, `权限不足`);
  await next();
};