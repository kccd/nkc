var SubscribeTypes;
$(function() {
  if(NKC.modules.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  var dom = $("#navbar_custom_dom");
  var leftDom = $("#leftDom");
  dom.html(leftDom.html());
  if(NKC.configs.lid) {
    window.Library = new NKC.modules.Library({
      lid: NKC.configs.lid,
      folderId: NKC.configs.folderId,
      tLid: NKC.configs.tLid,
      closed: NKC.configs.closed,
      uploadResourcesId: NKC.configs.uploadResourcesId.split("-")
    });
  }
});

function showSameForums() {
  $(".sameForums").slideToggle();
}

