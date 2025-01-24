const rs = [
  {
    map: /^\/read\.php\?.*tid=([0-9]{1,10})/,
    to: '/t/$1',
  },
  {
    map: /^\/index\.php\?.*fid=([0-9]{1,10})/,
    to: '/f/$1',
  },
  {
    map: /^\/read-kc-tid-([0-9]{1,10}).*\.html/,
    to: '/t/$1',
  },
  {
    map: /^(.+?)\/(\?.*)?$/,
    to: '$1$2',
  },
];

module.exports = (ctx, next) => {
  const { url } = ctx;
  const res = rs.find((e) => {
    return url.match(e.map);
  });
  if (res) {
    let redirectUrl = url.replace(res.map, res.to);
    if (redirectUrl === '') {
      redirectUrl = '/';
    }
    ctx.status = 301;
    return ctx.redirect(redirectUrl);
  }
  return next();
};
