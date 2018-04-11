const settings = require('../settings');
const mongoose = settings.database;
const {Map} = require('immutable');
const {
  methodEnum,
  certificates,
  parameter,
  name,
  time,
  allContentClasses
} = settings.permission;
const {_hour, _day, _month, _year} = time;

const levelOrder = {
  banned: -1,
  visitor: 0,
  default: 1,
  email: 1,
  mobile: 1,
  examinated: 2,
  qc: 1,
  scholar: 3,
  moderator: 4,
  senior_moderator: 5,
  editor: 6,
  dev: 7
};


function excuteLevel(user) {
  if(!user) return 0;
  const {certs} = user;
  let level = -1;
  for(const cert of certs) {
    if(levelOrder[cert] > level)
      level = levelOrder[cert]
  }
  return level
}

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

/* 只能取到最后一个证书所具有的权限
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
*/

function getPermitTree(certs) {
	let tree = {};
	for(const cert of certs) {
		let inheritTree = {};
		let certificate = certificates[cert];
		if(certificate.inheritFrom)
			inheritTree = getPermitTree(certificate.inheritFrom);
		tree = mergeTree(tree, mergeTree(inheritTree, certificate));
	}
	return tree;
}

// 拿到能看到名字的板块
async function getVisibleFid() {
  const cc = this.data.certificates.contentClasses;
  const cursor = await mongoose.connection.db.collection('forums').find(
    {
      $or: [
        {
          class: {$in: cc},
          visibility: true
        },
        {
          isVisibleForNCC: true,
          visibility: true
        }
      ]
    }
  );
  const fs = await cursor.toArray();
  return fs.map(e => e.fid);
}

// 拿到能访问的板块
async function getAccessibleFid() {
	const cc = this.data.certificates.contentClasses;
	const cursor = await mongoose.connection.db.collection('forums').find({class: {$in: cc}});
	const fs = await cursor.toArray();
	return fs.map(e => e.fid);
}

// 可从中加载出帖子在列表中显示，如主页（高权限的账号能够访问回收站，但是主页不需要显示回收站的帖子）
async function getThreadListFid() {
	const cc = this.data.certificates.contentClasses;
	const cursor = await mongoose.connection.db.collection('forums').find(
		{
			class: {$in: cc},
			visibility: true
		}
	);
	const fs = await cursor.toArray();
	return fs.map(e => e.fid);
}

//获取管理员能进的所有路由
const adminCertificates = getPermitTree(['dev']);


module.exports = async (ctx, next) => {
  let certs = ['visitor'];
  if(ctx.data.user) {
    certs = ctx.data.user.certs;
  }
  const cs = getPermitTree(certs);
  ctx.allContentClasses = allContentClasses;
  cs.contentClasses = Object.keys(cs.contentClasses || {})
    .filter(e => cs.contentClasses[e]);
  ctx.data.certificates = cs;
  ctx.data.methodEnum = methodEnum;
  ctx.data.parameter = parameter;
  ctx.data.ensurePermission = function(method = this.method, path = this.path, permittedOperations = this.data.certificates.permittedOperations) {
    let obj = permittedOperations;
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
  ctx.getAccessibleFid = getAccessibleFid;
  ctx.getThreadListFid = getThreadListFid;
  ctx.generateMatchBase = (base = {}) => {
    if(ctx.data.userLevel < 4)
      base.disabled = false;
    return Map(base)
  };
  ctx.data.userLevel = excuteLevel(ctx.data.user);
  if(!ctx.data.ensurePermission()) {
  	if(ctx.data.ensurePermission(ctx.method, ctx.path, adminCertificates.permittedOperations)){
		  if(ctx.data.userLevel < 0) {
			  ctx.throw(403, '您的账号已被封禁，请退出登陆后重新注册。');
		  }
			//403
		  ctx.throw(403, '您没有权限访问该资源。');
	  } else {
			//404
		  ctx.throw(404, '资源未找到');
	  }
  }
  await next();
};