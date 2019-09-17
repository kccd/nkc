module.exports = {
  contentLength: (content) => {
    const zhCN = content.match(/[^\x00-\xff]/g) || [];
    return length2 = content.length + zhCN.length;
  },
  contentFilter: (content) => {
    return content.replace(/\[quote=.*][\s\S]+\[\/quote]/g, '')
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
  },
	checkEmailFormat: (email) => {
		let path = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
		return email.search(path);
	},
  replaceChineseToCharRef: content => {
    const chars = content.split('');
    if(chars.length > 0)
      return chars
        .map(char => {
          const flag = char.match(/[^\x00-\xff]/);
          if (flag) {
            return '&#x' + char.charCodeAt(0).toString(16).toUpperCase() + ';';
          }
          return char
        })
        .reduce((pre, cur) => pre + cur)
  }
};