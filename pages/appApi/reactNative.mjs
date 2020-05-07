NKC.methods.rn = {};

NKC.methods.rn.postMessage = function(obj) {
  window.ReactNativeWebView.postMessage(JSON.stringify(obj));
};
NKC.methods.rn.emit = function(type, data) {
  data = data || {};
  NKC.methods.rn.postMessage({
    type: type,
    data: data
  });
};

function urlPathEval(fromUrl, toUrl) {
  if (!toUrl) {
    toUrl = fromUrl;
    fromUrl = location.href;
  }
  let fullFromUrl = new URL(fromUrl, location.origin);
  return new URL(toUrl, fullFromUrl).href;
}

document.body.addEventListener('click', (e)  => {
  const target = e.target;
  const targetNodeName = target.nodeName.toLowerCase();
  const dataType = target.getAttribute('data-type');
  let src = target.getAttribute('src');
  if(!src) src = target.getAttribute('data-src');
  if(targetNodeName === 'img' && dataType === 'view' && src) {
    src = window.location.origin + src;
    // 图片处理
    const images = document.querySelectorAll('img[data-type="view"]');
    const urls = [];
    let index;
    for(let i = 0; i < images.length; i++) {
      const image = images[i];
      const name = image.getAttribute('alt');
      let _src = image.getAttribute('src');
      if(!_src) {
        _src = image.getAttribute('data-src');
      }
      if(!_src) return;
      _src = window.location.origin + _src;
      if(_src === src) {
        index = i;
      }
      urls.push({
        url: _src,
        name
      });
    }
    NKC.methods.rn.emit('viewImage', {
      urls,
      index,
    });
    e.preventDefault();
  } else {
    // 链接处理
    let $a = null;
    if (targetNodeName === 'a') {
      $a = target;
    } else {
      $a = $(target).parents('a');
      if($a.length) $a = $a[0];
    }
    let href, title;
    if($a) {
      href = $a.getAttribute('href');
      title = $a.getAttribute('title');
    }
    if(href && $a.getAttribute('data-type') !== 'reload') {
      e.preventDefault();
      const targetUrl = urlPathEval(location.href, href);
      NKC.methods.rn.emit('openNewPage', {
        href: targetUrl,
        title
      });
    }
  }
});
