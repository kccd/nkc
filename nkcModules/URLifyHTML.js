var rule = /([^“”‘’\/<\'\"\(\[\]\=]|^)\b((?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$])/gi;
function URLifyHTML(content){
  return content.replace(rule,function(a,b,c,d,e){
    var tagLink = "";
    // 两种情况
    // 1.url不在a标签中，重新处理，并包裹到a标签中
    // 2.url在a标签中，不予处理
    if(b.indexOf(">") === -1) {
      // 两种情况
      // 1.url含有http或者https头部,不做特殊处理,否则链接组装会变为http://https://XXXXX
      // 2.url不含http或者https头部,添加http头部
      if(c.indexOf("http") > -1) {
        tagLink = b + '<a href="'+c+'" target="_blank">' + c + '</a>';
      }else{
        tagLink = b + '<a href="http://'+c+'" target="_blank">' + c + '</a>';
      }
    }else{
      tagLink = a
    }
    return tagLink;
  });
}
if(typeof window === 'undefined') {
  module.exports = URLifyHTML;
} else {

}
