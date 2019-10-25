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

function createLibrary(fid) {
  nkcAPI("/f/" + fid + "/library", "POST", {})
    .then(function() {
      sweetSuccess("文库已开通");
    })
    .catch(function(data) {
      sweetError(data);
    })
}