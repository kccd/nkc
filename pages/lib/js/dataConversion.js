/*
* 字符串转对象，对应pug渲染函数objToStr
* @param {String} str 对象字符串
* @return {Object}
* @author pengxiguaa 2019-7-26
* */
export function strToObj(str) {
  return JSON.parse(decodeURIComponent(str));
}

export function getDataById(id) {
  const dom = document.getElementById(id);
  if(dom) {
    return strToObj(dom.innerHTML);
  } else {
    return {};
  }
}

export function resourceToHtml(type, rid, name) {
  var handles = {
    "picture": function() {
      return "<img data-tag='nkcsource' data-type='picture' data-id='"+ rid +"' src=\"/r/"+ rid +"\">";
    },
    "sticker": function() {
      return "<img data-tag='nkcsource' data-type='sticker' data-id='"+ rid +"' src=\"/sticker/"+ rid +"\">";
    },
    "video": function() {
      return '<p><br></p><p><video data-tag="nkcsource" data-type="video" data-id="'+ rid +'" src="/r/'+ rid +'" controls></video>'+ decodeURI("%E2%80%8E") +'</p>';
    },
    "audio": function() {
      return '<p><br></p><p><audio data-tag="nkcsource" data-type="audio" data-id="'+ rid +'" src="/r/'+ rid +'" controls></audio>'+ decodeURI("%E2%80%8E") +'</p>';
    },
    "attachment": function() {
      return '<p><a data-tag="nkcsource" data-type="attachment" data-id="'+ rid +'" href="/r/'+ rid +'" target="_blank" contenteditable="false">'+ name +'</a>&#8203;</p>'
    },
    "pre": function() {},
    "xsf": function() {
      return '<p><br></p><section data-tag="nkcsource" data-type="xsf" data-id="'+ rid +'" data-message="浏览这段内容需要'+ rid +'学术分(双击修改)"><p>&#8203;<br></p></section>';
    },
    "twemoji": function() {
      var emojiChar = twemoji.convert.fromCodePoint(rid);
      return "<img data-tag='nkcsource' data-type='twemoji' data-id='"+ rid +"' data-char='"+ emojiChar +"' src=\"/twemoji/2/svg/"+ rid +".svg\">";
    },
    "formula": function() {}
  };
  var hit = handles[type];
  return hit? hit() : "";
}
