new Vue({
  el: "#app",
  data: {
    statu: "wait",
    time: 0,
    code: "",
    complete: false
  },
  methods: {
    sendSmsCode: function() {
      var self = this;
      self.statu = "sendding";
      nkcAPI("./phoneVerify/sendSmsCode", "POST")
        .then(function(data) {
          var countdownLen = data.countdownLen;
          self.time = countdownLen;
          self.statu = "countdown";
          var timer = setInterval(function() {
            self.time -= 1;
            if(self.time === 0) {
              clearInterval(timer);
              self.statu = "wait";
              self.time = 0;
            }
          }, 1000);
        })
        .catch(function(data) {
          sweetError(data);
          self.statu = "wait";
          self.time = 0;
        })
    },
    submit: function() {
      var self = this;
      nkcAPI("./phoneVerify", "POST", { code: self.code })
        .then(function() {
          self.complete = true;
          return sweetAlert("验证成功");
        })
        .then(function() {
          location.href = document.referrer;
        })
        .catch(sweetError)
    },
    toModifyPhoneNumber: function() {
      location.href = "./settings/security";
    }
  }
});