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

var app = new Vue({
  el: "#app",
  data: {

  },
  methods: {
    saveLimit: function() {

    }
  }
});