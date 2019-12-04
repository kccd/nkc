var data = NKC.methods.getDataById("data");
var bodyBackgroundColor = data.color;
var CommonModal, SubscribeTypes;
$(function() {
  NKC.methods.initSelectColor(function(color) {
    $("body").css({
      "background-color": color
    });
    bodyBackgroundColor = color;
  });
  CommonModal = new NKC.modules.CommonModal();
  if(NKC.modules.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
});

function showSetDom() {
  $(".column-fast-set-body").toggle();
}
function showShareDom(){
  $(".column-share-body").toggle();
}
function saveSettings() {
  nkcAPI("/m/" + data.columnId, "PATCH", {
    type: "color",
    color: bodyBackgroundColor
  })
    .then(function() {
      screenTopAlert("保存成功");
      showSetDom();
    })
    .catch(function(d) {
      screenTopWarning(d)
    })
}

function openNewWindow(url) {
  var origin = window.location.origin;
  var reg = new RegExp("^" + origin, "i");
  if(reg.test(url)) {
    openToNewLocation(url);
  } else {
    openToNewLocation(url, "_blank");
  }

}
function pushToHome(id, type) {
  var method = type === "push"? "POST": "DELETE";
  nkcAPI("/m/" + id + "/top", method)
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError);
}