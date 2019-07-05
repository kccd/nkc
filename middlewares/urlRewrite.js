const rs = [
  {map:/^\/read\.php\?.*tid=([0-9]{1,10})/,to:'/t/$1'},
  {map:/^\/index\.php\?.*fid=([0-9]{1,10})/,to:'/f/$1'},

];

module.exports = (ctx, next) => {
  const {url, nkcModules} = ctx;
  const res = rs.find(e => {
    return url.match(e.map);
  });
  if(res) {
    redirectUrl = url.replace(res.map, res.to);
    ctx.status = 301;
    return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, redirectUrl));
  }
  return next()
};