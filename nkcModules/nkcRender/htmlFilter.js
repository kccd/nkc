const xss = require('xss');
const wl = xss.whiteList;
wl.font = ['color'];
wl.code = ['class'];
wl.span = ['style'];
wl.a = ['target', 'href', 'title', 'style'];
wl.p = ['align','style'];
wl.div = ['style'];
wl.table = ['border','width','cellpadding','cellspacing'];
wl.tbody = [];
wl.tr = [];
wl.th = ['width'];
wl.td = ['width','valign','colspan','top','rowspan'];
wl.math = [];
wl.semantics = [];
wl.mrow = [];
wl.msup = [];
wl.mn = [];
wl.annotation = ['encoding'];
wl.iframe = [];
wl.embed = [];
wl.img = ['src'];
wl.pre = ['class'];
wl.video = ['src'];
wl.audio = ['src'];
wl.nkcsource = ['data-type', 'data-id'];
for(var i = 1; i <= 6; i++) {
  wl['h'+i] = ['style'];
}


const nkcXSS = new xss.FilterXSS({
  css: {
    whiteList: {
      position: /^fixed|relative$/,
      top: true,
      left: true,
      fontSize: true,
      display: true,
      "background-image": true,
      "font-weight":true,
      "font-size":true,
      "font-style":true,
      "text-decoration-line":true,
      "text-decoration": true,
      "background-color":true,
      "color":true,
      "font-family":true,
      "text-align":true,
      "text-indent":true,
      "padding-bottom":true,
      "padding-top":true,
      "padding-left":true,
      "padding-right":true,
      "height":true,
      "width":true,
      "vertical-align":true,
      "margin-top":true,
      "bottom":true,
      "word-spacing":true,
      "border-bottom":true,
      "max-width": true
    }
  }
});

module.exports = (html) => {
  html = xss(html, {
    whiteList: wl,
    onTagAttr: function(tag, name, value, isWhiteAttr) {
      if(isWhiteAttr) {
        if(tag === 'a' && name === 'href') {
          const valueHandled = value.replace('javascript:', '');
          return `href=${valueHandled}`;
        }
      }
    }
  });
  return nkcXSS.process(html);
};