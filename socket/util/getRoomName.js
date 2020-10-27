const map = {
  "console": "CONSOLE",
  "user"   : (uid) => `USER:${uid}`,
  "forum"  : (fid) => `FORUM:${fid}`,
};

module.exports = function(type, ...params) {
  let value = map[type];
  let valueType = typeof value;
  if(valueType === "function") {
    return value.apply(null, params);
  } else {
    return value;
  }
};
