var SubscribeTypes;
$(function() {
  SubscribeTypes = new NKC.modules.SubscribeTypes();
  var dom = $("#navbar_custom_dom");
  var leftDom = $("#leftDom");
  dom.html(leftDom.html());
});

function showSameForums() {
  $(".sameForums").slideToggle();
}