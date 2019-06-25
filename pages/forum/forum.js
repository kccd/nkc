$(function() {
  var dom = $("#navbar_custom_dom");
  var leftDom = $("#leftDom");
  dom.html(leftDom.html());
});


function showSameForums() {
  $(".sameForums").slideToggle();
}