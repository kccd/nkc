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

$('a[href]:not([data-type="reload"])').on('click', function(e) {
  e.preventDefault();
  let href = '';
  const target = e.target;
  if (target.nodeName.toLocaleLowerCase() === 'a') {
    href = target.href;
  } else {
    href = $(target)
      .parents('a')
      .attr('href');
  }
  const targetUrl = urlPathEval(location.href, href);
  NKC.methods.rn.emit('openNewPage', {
    href: targetUrl
  });
});

