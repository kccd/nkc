module.exports = (type, v1, v2) => {
  switch(type) {
    case 'forumsId': return `forums:id`;
    case 'forumData': return `forum:${v1}`;
  }
}
