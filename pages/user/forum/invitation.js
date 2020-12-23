var dataEl = document.getElementById("data");
var data = JSON.parse(dataEl.innerText);
var pfid = data.pfid;

new Vue({
  el: "#app",
  data: {
    formName: data.forumName,
    founder: data.founder,
    protocolContent: data.founderGuide,
    agree: null,
  },
  methods: {
    resolve: function() {
      var self = this;
      var url = '/u/' + NKC.configs.uid + '/forum/invitation';
      nkcAPI(url, "POST", {
        pfid: pfid,
        res: 'resolved'
      })
        .then(function(data) {
          sweetSuccess('执行成功');
          self.agree = true;
        })
        .catch(function(data){
          sweetError(data);
        })
    },
    reject: function() {
      var self = this;
      var url = '/u/' + NKC.configs.uid + '/forum/invitation';
      nkcAPI(url, "POST", {
        pfid: pfid,
        res: 'rejected'
      })
        .then(function(data) {
          sweetSuccess('执行成功');
          self.agree = false;
        })
        .catch(function(data){
          sweetError(data);
        })
    }
  }
});
