module.exports = {
  contentLength: (content) => {
    const zhCN = content.match(/[^\x00-\xff]/g);
    const other = content.match(/[\x00-\xff]/g);
    const length1 = zhCN? zhCN.length * 2 : 0;
    const length2 = other? other.length : 0;
    return length1 + length2
  },
  checkPass: (s) => {
    let ls = 0;
    if(s.match(/([a-zA-Z])+/)){
      ls++;
    }
    if(s.match(/([0-9])+/)){
      ls++;
    }
    if(s.match(/[^a-zA-Z0-9]+/)){
      ls++;
    }
    return (ls >= 2);
  }
};