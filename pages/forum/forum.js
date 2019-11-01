var SubscribeTypes;
$(function() {
  if(NKC.modules.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  var dom = $("#navbar_custom_dom");
  var leftDom = $("#leftDom");
  dom.html(leftDom.html());
  if(NKC.configs.lid) {
    window.Library = new NKC.modules.Library(NKC.configs.lid);
  }
});

function showSameForums() {
  $(".sameForums").slideToggle();
}

