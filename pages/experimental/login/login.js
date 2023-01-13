var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    password: "",
    error: "",
    info: ""
  },
  mounted() {
    console.log('mo')
    },
  methods: {
    submit: function() {
      this.error = "";
      this.info = "";
      if(!this.password) return this.password = "请输入密码";
      nkcAPI("/e/login", "POST", {
        password: this.password,
      })
        .then(function(res) {
          if(data && data.toUrl){
            NKC.methods.visitUrl(data.toUrl);
          }else {
            NKC.methods.visitUrl(res.redirect);
          }
        })
        .catch(function(res) {
          app.error = res.error || res;
        })
    }
  }
})
