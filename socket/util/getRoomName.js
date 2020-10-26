module.exports = (type, v1, v2, v3) => {
  return {
    console: 'CONSOLE',
    message: `USER:${v1}`,
    forum: `FORUM:${v1}`,
  }[type];
};
