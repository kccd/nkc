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
  let $a = null;
  if (target.nodeName.toLocaleLowerCase() === 'a') {
    $a = target;
  } else {
    $a = $(target).parents('a');
    if($a.length) $a = $a[0];
  }
  const href = $a.getAttribute('href');
  if($a && $a.getAttribute('data-type') !== 'reload' && href) {
    e.preventDefault();
    const targetUrl = urlPathEval(location.href, href);
    NKC.methods.rn.emit('openNewPage', {
      href: targetUrl
    });
  }
});


