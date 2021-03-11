NKC.methods.rn = {
  index: 0,
  callback: {}
};

NKC.methods.rn.postMessage = function(obj) {
  window.ReactNativeWebView.postMessage(JSON.stringify(obj));
};

NKC.methods.rn.emit = function(type, data, callback) {
  data = data || {};
  var index = NKC.methods.rn.index++;
  NKC.methods.rn.callback[index] = callback;
  NKC.methods.rn.postMessage({
    type: type,
    data: data,
    webFunctionId: index
  });
};

NKC.methods.rn.onMessage = function(res) {
  var webFunctionId = res.webFunctionId;
  var data = res.data;
  var func = NKC.methods.rn.callback[webFunctionId];
  if(func) {
    func(data);
  }
}

NKC.methods.rn.updateMusicListAndPlay = function(targetRid) {
  var elements = $('span[data-tag="nkcsource"][data-type="audio"]');
  var audiosId = [];
  for(var i = 0; i < elements.length; i ++) {
    var e = elements.eq(i);
    var rid = e.attr('data-id');
    if(audiosId.indexOf(rid) === -1) {
      audiosId.push(rid)
    }
  }
  var index = audiosId.indexOf(targetRid);
  if(index > 0) {

    var _audiosId = audiosId.splice(0, index);
    audiosId = audiosId.concat(_audiosId);
  }
  var list = [];
  for(var i = 0; i < audiosId.length; i ++) {
    list.push({
      url: window.location.origin + '/r/' + audiosId[i]
    });
  }
  NKC.methods.rn.emit('updateMusicListAndPlay', {list: list});
}


function urlPathEval(fromUrl, toUrl) {
  if (!toUrl) {
    toUrl = fromUrl;
    fromUrl = location.href;
  }
  let fullFromUrl = new URL(fromUrl, location.origin);
  return new URL(toUrl, fullFromUrl).href;
}



document.addEventListener('click', (e)  => {
  const target = e.target;
  const targetNodeName = target.nodeName.toLowerCase();
  const dataType = target.getAttribute('data-type');
  let src = target.getAttribute('data-src');
  if(!src) src = target.getAttribute('src');
  if(targetNodeName === 'img' && dataType === 'view' && src) {
    src = window.location.origin + src;
    // 图片处理
    const images = document.querySelectorAll('img[data-type="view"]');
    const urls = [];
    let index;
    for(let i = 0; i < images.length; i++) {
      const image = images[i];
      const name = image.getAttribute('alt');
      let _src = image.getAttribute('data-src');
      if(!_src) {
        _src = image.getAttribute('src');
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

// 同步cookie信息
NKC.methods.rn.emit('syncPageInfo', {uid: NKC.configs.uid});
