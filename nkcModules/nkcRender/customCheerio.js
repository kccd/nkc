const cheerio = require("cheerio");
const {htmlEscape, reduceHtml} = require("./htmlEscape");

/**
 * 按顺序遍历文本节点,需传入handle
 * @param {Object} node - cheerio dom节点
 * @param {Function} handle - 处理器
 */
function eachTextNode(node, handle) {
  if(!handle) return;
  // console.log(node);
  if(node.type === "text") {
    handle(node.data, node);
  }else if(node.children.length) {
    for(let child of node.children) {
      eachTextNode(child, handle)
    }
  }
}


/**
 * 转义文本节点中的<>&字符
 * @param {Object} $node - cheerio 被包装的dom节点
 */
function safeTextNode($node) {
  $node.each((index, node) => {
    eachTextNode(node, (text, node) => {
      if(!text) return;
      // console.log(text);
      node.data = htmlEscape(text);
      /*node.data = text.replace(/\<|\>|\&/g, source => {
        if(source === "<") return "&lt;";
        if(source === ">") return "&gt;";
        if(source === "&") return "&amp;";
      })*/
    })
  })
}

/**
 * 
 * @param {Object} $node - cheerio 被包装的dom节点
 */
function reduTextNode($node) {
  $node.each((index, node) => {
    eachTextNode(node, (text, node) => {
      if(!text) return;
      node.data = reduceHtml(text);
      /*node.data = text.replace(/(\&lt;)|(\&gt;)|(\&amp;)/g, source => {
        if(source === "&lt;") return "<";
        if(source === "&gt;") return ">";
        if(source === "&amp;") return "&";
      })*/
    })
  })
}


// 修改load方法
(() => {
  let oldLoad = cheerio.load;
  function newLoad(html, option) {
    let $ = oldLoad.call(cheerio, html, {
      decodeEntities: false,
      ...option
    })
    /*$("pre").each((index, el) => {
      let newCode = $(el).html();
      /!*let newCode = $(el).html().replace(/\[<>]|&(?!amp;)/g, source => {
        if(source === "<") return "&lt;";
        if(source === ">") return "&gt;";
        if(source === "&") return "&amp;";
        // return "&";
      })*!/
      $(el).text(newCode);
      // console.log($(el).text());
      // console.log($(el)[0].children)
    });*/
    return $;
  }
  cheerio.load = newLoad;
})();

// 输出html时,将文本节点中的 < 和 > 转成 &lt; 和 &gt;
(() => {
  let oldLoad = cheerio.load;
  function newLoad(html, option) {
    let $ = oldLoad.call(cheerio, html, option);
    function new$() {
      let selector = $.apply(null, arguments);        // $ 函数this指向global
      if(!selector.length) return selector;           // 如果selector不是数组或者没有选中任何元素,那就不处理
      if(!selector.html) return selector;             // 我们需要代理的方法必须存在才能去代理
      let oldHtml = selector.html;
      // 输出字符转义后的html
      selector.safeHtml = function(p) {
        if(p) oldHtml.apply(selector, arguments);
        // 先转义文本节点中的标签字符
        safeTextNode(selector);
        let output = oldHtml.apply(selector, arguments);
        // 输出完之后再转回来
        reduTextNode(selector);
        return output;
      }
      /*// 输出原始html
      selector.html = function() {
        return oldHtml.apply(selector, arguments);
      }*/
      return selector;
    }
    new$.__proto__ = $;                             // 继承 $ 下的其它方法
    return new$;
  }

  cheerio.load = newLoad;
})();



module.exports = cheerio;