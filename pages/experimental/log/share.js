/*
function searchCode() {
  var code = $("#codeInp").val();
  if(!code) return sweetWarning("分享码不能为空");
  openToNewLocation('/e/log/share?&content=' + code);
}*/
var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    t: data.t || "username",
    c: data.c || ""
  },
  methods: {
    search: function() {
      var t = this.t;
      var c = this.c;
      var url = "/e/log/share?t=" + t + "&c=" + c;
      NKC.methods.visitUrl(url, false);
    },
    reset: function() {
      NKC.methods.visitUrl("/e/log/share", false);
    }
  }
});