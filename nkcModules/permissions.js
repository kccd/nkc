const parameter = Symbol('parameter');
const GET = Symbol('GET');
const POST = Symbol('POST');
const DELETE = Symbol('DELETE');
const PATCH = Symbol('PATCH');
const OPTIONS = Symbol('OPTIONS');
const PUT = Symbol('PUT');
const name = Symbol('name');

const methodEnum = {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  OPTIONS
};

const certificates ={
  banned: {
    displayName: '开除学籍',
    contentClasses: {
      non_public: false,
      non_images: false
    },
    permittedOperations: {
      me: {
        [GET]: true
      }
    }
  },
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
        [parameter]: {
          [GET]: true,
          [POST]: true,
        }
      },
      register: {
        [name]: '注册',
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
          [parameter]: {
            [POST]: true,
            [GET]: true
          }
        },
        system: {
          [name]: '系统',
          [GET]: true
        }
      },
      m: {
        [parameter]: {
          [POST]: true
        }
      },
      t: {
        [parameter]: {
          [POST]: true,
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
        [parameter]: {
          subscribe: {
            [name]: '订阅',
            [GET]: true,
            [POST]: true,
            [DELETE]: true
          },
          collections: {
            [name]: '收藏',
            [GET]: true,
            [POST]: true,
            [DELETE]: true,
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
        }
      }
    }
  },
  mail: {
    displayName: '笔友',
    inheritFrom: ['default'],
  },
  mobile: {
    displayName: '机友',
    inheritFrom: ['default'],
  },
  examinated: {
    displayName: '进士',
    inheritFrom: ['default'],
    contentClasses: {
      professional: true
    }
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
      history: {
        [GET]: true
      }
    }
  },
  moderator: {
    displayName: '版主',
    inheritFrom: ['scholar'],
    contentClasses: {
      classified: true
    },
    permittedOperations: {
      experimental: {
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
        }
      },
      u: {
        [GET]: true,
        [parameter]: {
          ban: {
            [POST]: true,
            [DELETE]: true
          }
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
          }
        },
        [PATCH]: true
      },
      p: {
        [GET]: true,
        [parameter]: {
          [DELETE]: true,
          credit: {
            [name]: '学术分',
            [PUT]: true
          }
        }
      },
    }
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
      }
    }
  },
  dev: {
    displayName: '运维',
    inheritFrom: ['editor'],
    permittedOperations: {
      experimental: {
        sysinfo: {
          [name]: '系统通知',
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
      certificate = getPermitTree(certificate.inheritFrom);
    tree = mergeTree(tree, certificate)
  }
  return tree
}

function ensurePermission(certs, path, method) {
  let obj = certs;
  const m = methodEnum[method];
  const routes = path.match(/\/([^\/]*)/g)
    .map(e => e.replace('/', ''))
    .filter(e => e !== '');
  for(const route of routes) {
    if(obj[route]) {
      obj = obj[route]
    }
    else if(obj[parameter]) {
      obj = obj[parameter]
    }
    else {
      throw `[${method}]/${route}权限不足`
    }
  }
  if(!obj[m])
    throw `权限不足`
}

function getUserDescription(user) {
  const {certs, username, xsf = 0, kcb = 0} = user;
  let cs = '';
  for(const cert of certs) {
    cs.concat(certificates[cert].displayName + ', ')
  }
  cs.slice(0, -1);
  return `${username}\n`+
    `学术分 ${xsf}\n`+
    `科创币 ${kcb}\n`+
    `${cs}`
}

module.exports = async (ctx, next) => {
  let certs = ['visitor'];
  if(ctx.data.user) {
    certs = ctx.data.user.certs;
    ctx.data.user.navbarDesc = getUserDescription(ctx.data.user);
  }
  console.log(certs);
  const cs = getPermitTree(certs);
  console.log(cs);
  ctx.data.certificates = cs;

  ctx.data.methodEnum = methodEnum;
  ctx.data.parameter = parameter;
  const method = ctx.method;
  try {
    ensurePermission(cs.permittedOperations, ctx.path, method);
  } catch (e) {
    ctx.throw(401, e)
  }
  await next();
}