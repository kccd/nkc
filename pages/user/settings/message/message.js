function removeFromBlackList(uid) {
  nkcAPI("/message/blackList", "POST", {
    type: "remove",
    tUid: uid
  })
    .then(function() {
      screenTopAlert("移除成功");
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
window.removeFromBlackList = removeFromBlackList;