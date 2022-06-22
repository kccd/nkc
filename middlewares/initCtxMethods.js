const cookieConfig = require("../config/cookie");
module.exports = async (ctx, next) => {
  // 权限判断
  // @param {String} o 操作名
  ctx.permission = (o) => {
    if(!ctx.data.userOperationsId) ctx.data.userOperationsId = [];
    return ctx.data.userOperationsId.includes(o);
  };
  ctx.permissionsOr = (operationsId) => {
    ctx.data.userOperationsId = ctx.data.userOperationsId || [];
    for(const id of operationsId) {
      if(ctx.data.userOperationsId.includes(id)) return true;
    }
    return false;
  };
  ctx.permissionsAnd = (operationsId) => {
    ctx.data.userOperationsId = ctx.data.userOperationsId || [];
    for(const id of operationsId) {
      if(!ctx.data.userOperationsId.includes(id)) return false;
    }
    return true;
  };

  let cookieDomain = '';
  try{
    cookieDomain = ctx.nkcModules.domain.getRootDomainByHost(ctx.host);
  } catch(err) {
    if(global.NKC.isDevelopment) {
      console.log(err);
    }
  }


  // 设置cookie
  // @param {String} key cookie名
  // @param {Object} value cookie值
  // @param {Object} o 自定义参数
  ctx.setCookie = (key, value, o) => {
    let options = {
      signed: true,
      httpOnly: true,
      overwrite: true,
      maxAge: cookieConfig.maxAge,
    };
    if(cookieDomain) {
      options.domain = cookieDomain;
    }
    // 开发模式 为了兼容多个调试域名而取消设置 cookie 域
    /*if(global.NKC.isDevelopment) {
      delete options.domain;
    }*/
    if(o) {
      options = Object.assign(options, o);
    }
    let valueStr = JSON.stringify(value);
    valueStr = Buffer.from(valueStr).toString("base64");
    ctx.cookies.set(key, valueStr, options);
  };

  ctx.clearCookie = (key) => {
    let options = {
      signed: true,
      httpOnly: true,
      overwrite: true,
      maxAge: 0,
    };
    if(cookieDomain) {
      options.domain = cookieDomain;
    }
    // 开发模式 为了兼容多个调试域名而取消设置 cookie 域
    /*if(global.NKC.isDevelopment) {
      delete options.domain;
    }*/
    ctx.cookies.set(key, '', options);
  }

  // 设置cookie
  // @param {String} key cookie名
  // @param {Object} o 自定义参数
  // @return {Object} cookie值
  ctx.getCookie = (key, o) => {
    let options = {
      signed: true,
    };
    if(cookieDomain) {
      options.domain = cookieDomain;
    }
    // 开发模式 为了兼容多个调试域名而取消设置 cookie 域
    /*if(global.NKC.isDevelopment) {
      delete options.domain;
    }*/
    if(o) {
      options = Object.assign(options, o);
    }
    let valueStr = '';
    try {
      valueStr = ctx.cookies.get(key, options);
      valueStr = Buffer.from(valueStr, "base64").toString();
      return JSON.parse(valueStr);
    } catch(err) {
      return valueStr;
    }
  };
  await next();
}
