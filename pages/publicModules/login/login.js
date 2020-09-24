var timeout, loginBehavior = [];
NKC.modules.Login = function() {
  var self = this;
  self.dom = $("#moduleLogin");
  self.dom.modal({
    show: false,
    backdrop: "static"
  });
  self.app = new Vue({
    el: "#moduleLoginApp",
    data: {
      nationCodes: nationCodes,
      type: "login",
      category: "username", // username, mobile, mobileCode
      username: "",
      password: "",
      nationCode: "86",
      code: "",
      mobile: "",
      imgCode: "",
      waiting: 0,
      svgData: "",
      error: "",
      info : "",
      submitting: false,
      succeed: false
    },
    methods: {
      selectCategory: function(category) {
        this.category = category;
        this.throwError("");
      },
      selectType: function(type) {
        this.type = type;
      },
      throwError: function(error) {
        this.error = error.error || error;
      },
      submit: function() {
        var throwError = this.throwError;
        throwError("");
        var this_ = this;
        var type = this.type;
        var category = this.category;

        var body = {};
        var username = this.username;
        var password = this.password;
        var mobile = this.mobile;
        var nationCode = this.nationCode;
        var imgCode = this.imgCode;
        var code = this.code;
        if(type === "login") {
          if(category === "username") {
            if(!username) return throwError("请输入用户名");
            if(!password) return throwError("请输入密码");
            body = {
              username: username,
              password: password,
              behavior: loginBehavior
            };
          } else if(category === "mobile") {
            if(!nationCode) return throwError("请选择国际区号");
            if(!mobile) return throwError("请输入手机号");
            if(!password) return throwError("请输入密码");
            body = {
              nationCode: nationCode,
              mobile: mobile,
              password: password,
              loginType: "mobile"
            };
          } else {
            if(!nationCode) return throwError("请选择国际区号");
            if(!mobile) return throwError("请输入手机号");
            if(!imgCode) return throwError("请输入图形验证码");
            if(!code) return throwError("请输入短信验证码");
            body = {
              loginType: "code",
              nationCode: nationCode,
              mobile: mobile,
              imgCode: imgCode,
              code: code,
            }
          }
          this.submitting = true;
          nkcAPI("/login", "POST", body)
          .then(function() {
            this_.succeed = true;
            if(NKC.configs.isApp) {
              NKC.methods.rn.emit("login")
            } else {
              window.location.reload();
            }
          })
          .catch(function(data) {
            throwError(data);
            this_.submitting = false;
          })
        } else {
          if(!nationCode) return throwError("请选择国际区号");
          if(!mobile) return throwError("请输入手机号");
          if(!imgCode) return throwError("请输入图形验证码");
          if(!code) return throwError("请输入短信验证码");
          this.submitting = true;
          nkcAPI("/register", "POST", {
            nationCode: nationCode,
            mobile: mobile,
            code: code,
            imgCode: imgCode
          })
            .then(function() {
              // window.location.reload();
              this_.succeed = true;
              if(NKC.configs.isApp) {
                NKC.methods.rn.emit("login")
              } else {
                window.location.href = "/register/subscribe";
              }
            })
            .catch(function(data) {
              throwError(data);
              this_.submitting = false;
            })
        }
      },
      sendMobileCode: function(t) {
        var throwError = this.throwError;
        throwError("");
        var this_ = this;
        var nationCode = this.nationCode;
        var mobile = this.mobile;
        var imgCode = this.imgCode;
        if(!nationCode) return throwError("请选择国际区号");
        if(!mobile) return throwError("请输入手机号码");
        if(!imgCode) return throwError("请输入图形验证码");
        var body = {
          nationCode: nationCode,
          mobile: mobile,
          imgCode: imgCode
        };
        var url;
        if(t === "register") {
          url = "/sendMessage/register";
        } else {
          url = "/sendMessage/login";

        }
        nkcAPI(url, "POST", body)
          .then(function() {
            clearTimeout(timeout);
            this_.waiting = 120;
            timeout = setInterval(function() {
              if(this_.waiting !== 0) {
                this_.waiting --;
              } else {
                clearTimeout(timeout);
              }
            }, 1000);
          })
          .catch(function(data) {
            throwError(data);
          });
      },
      getSvgData: function() {
        var this_ = this;
        nkcAPI("/register/code?t=" + Date.now(), "GET")
          .then(function(data) {
            this_.svgData = data.svgData;
          })
          .catch(function(data) {
            sweetError(data);
          })
      },
      close: function() {
        loginBehavior.length = 0;
        if(NKC.configs.isApp) {
          NKC.methods.rn.emit("closeWebView");
        } else {
          self.dom.modal("hide");
        }
      },
      open: function(type) {
        self.dom.modal("show");
        self.app.type = type || "login";
        self.app.getSvgData();
        self.app.startRecoredding();
      },
      // 开始记录用户行为
      startRecoredding: function() {
        var target = $(this.$el).find(".modal-content");
        target.on("mousemove", function(e) {
          console.log(e.originalEvent.clientX, e.originalEvent.clientY);
          loginBehavior.push({
            type: "mousemove",
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY
          })
        });
        target.on("keydown", function(e) {
          loginBehavior.push({
            type: "keydown",
            key: e.key
          })
        });
        target.on("mousedown", function(e) {
          loginBehavior.push({
            type: "mousedown",
            x: e.originalEvent.clientX,
            y: e.originalEvent.clientY
          })
        })
      }
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};

var Login = new NKC.modules.Login();
