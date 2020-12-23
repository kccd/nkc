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
      nkcAPI("/founderInvite/accept/"+ pfid +"?res=resolve", "GET")
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
      nkcAPI("/founderInvite/accept/"+ pfid +"?res=reject", "GET")
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