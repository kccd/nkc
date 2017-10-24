const parameter = Symbol('parameter');
const GET = Symbol('GET');
const POST = Symbol('POST');
const DELETE = Symbol('DELETE');
const PATCH = Symbol('PATCH');
const OPTIONS = Symbol('OPTIONS');
const PUT = Symbol('[PUT]');


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
      login: {
        name: '登录',
        [GET]: true,
        [POST]: true,
        [DELETE]: true
      },
      latest: {
        name: '最近',
        [GET]: true
      },
      activities: {
        name: '动态',
        [parameter]: {
          [GET]: true
        }
      },
      editor: {
        name: '编辑器',
        [GET]: true
      },
      t: {
        name: '贴子',
        [parameter]: {
          [GET]: true
        }
      },
      f: {
        name: '板块',
        [GET]: true,
        [parameter]: {
          [GET]: true
        }
      },
      u: {
        name: '用户',
        [parameter]: {
          [GET]: true
        }
      },
      m: {
        name: '专栏',
        [parameter]: {
          [GET]: true
        }
      },
      search: {
        name: '搜索',
        [GET]: true,
        [POST]: true,
      },
      exam: {
        name: '考试',
        [parameter]: {
          [GET]: true,
          [POST]: true,
        }
      },
      register: {
        name: '注册',
        [parameter]: {
          [GET]: true,
          [POST]: true,
        }
      },
      r: {
        name: '附件',
        [parameter]: {
          [GET]: true,
        }
      },
      rt: {
        name: '附件',
        [parameter]: {
          [GET]: true
        }
      },
      p: {
        name: '推文',
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
        }
      },
      sms: {
        name: '信息',
        at: {
          [GET]: true
        },
        replies: {
          [GET]: true
        },
        message: {
          [GET]: true,
          [parameter]: {
            [POST]: true,
            [GET]: true
          }
        },
        system: {
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
            [POST]: true,
            [DELETE]: true
          },
          digestInPF: {
            [POST]: true,
            [DELETE]: true
          },
          invisibleInPF: {
            [POST]: true,
            [DELETE]: true
          }
        }
      }
    }
  }
};

function filterKeys(e) {
  return e !== 'inheritFrom' && e !== 'displayName' && e !== 'name'
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
      throw `路径/${route}权限不足`
    }
  }
  if(!obj[method])
    throw `权限不足`
}

module.exports = async (ctx, next) => {
  const certs = ctx.data.user ? ctx.data.user.certs : ['visitor'];
  const cs = getPermitTree(certs);
  ctx.data.certificates = cs;
  const methodEnum = {
    GET,
    POST,
    PUT,
    PATCH,
    DELETE,
    OPTIONS
  };
  ctx.data.methodEnum = methodEnum;
  ctx.data.parameter = parameter;
  const method = ctx.method;
  const m = methodEnum[method];
  try {
    ensurePermission(cs.permittedOperations, ctx.path, m);
  } catch (e) {
    ctx.throw(401, e)
  }
  await next();
}