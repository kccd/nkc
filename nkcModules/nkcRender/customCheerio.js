const cheerio = require("cheerio");


/**
 * 按顺序遍历文本节点,需传入handle
 * @param {Object} node - cheerio dom节点
 * @param {Function} handle - 处理器
 */
function eachTextNode(node, handle) {
  if(!handle) return;
  if(node.type === "text") {
    handle(node.data, node);
  }else if(node.type === "tag") {
    for(let child of node.children) {
      eachTextNode(child, handle)
    }
  }
}


// 修改load方法
(() => {
  let oldLoad = cheerio.load;
  function newLoad(html, option) {
    return oldLoad.call(cheerio, html, {
      decodeEntities: false,
      ...option
    });
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
      selector.html = function() {
        eachTextNode(selector[0], (text, node) => {
          if(!text) return;
          node.data = text.replace(/\<|\>/g, source => {
            if(source === "<") return "&lt;";
            if(source === ">") return "&gt;";
          })
        })
        return oldHtml.apply(selector, arguments);
      }
      return selector;
    }
    new$.__proto__ = $;                             // 继承 $ 下的其它方法
    return new$;
  }

  cheerio.load = newLoad;
})();



module.exports = cheerio;