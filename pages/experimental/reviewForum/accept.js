var dataEl = document.getElementById("data");
var data = JSON.parse(dataEl.innerText);
var pfid = data.pfid;

new Vue({
  el: "#app",
  data: {
    formName: data.forumName,
    protocolContent: data.founderGuide
  },
  methods: {
    resolve: function() {
      nkcAPI("/founderInvite/accept/"+ pfid +"?res=resolved", "GET")
        .then(function(data) {
          return Swal({
            confirmButtonText: "关闭",
            text: data.message
          });
        })
        .then(function() {
          close();
        })
    },
    reject: function() {
      nkcAPI("/founderInvite/accept/"+ pfid +"?res=rejectd", "GET")
        .then(function(data) {
          return Swal({
            confirmButtonText: "关闭",
            text: data.message
          });
        })
        .then(function() {
          close();
        })
    }
  }
});
