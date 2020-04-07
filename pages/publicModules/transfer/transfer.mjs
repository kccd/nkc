NKC.modules.Transfer = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleTransfer"); 
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: "#moduleTransferApp",
      data: {
        loading: true,
        error: "",
        password: "",
        number: "",
        tUid: "",
        kcbOnce: "",
      },
      methods: {
        open(callback, tUid) {
          this.tUid = tUid;
          nkcAPI(`/u/${tUid}/transfer?t=${Date.now()}`, "GET")
            .then(data => {
              self.app.kcbOnce = data.kcbOnce;
            })
            .catch(data => {
              self.app.kcbOnce = data.kcbOnce;
              self.app.error = data.error || data;
            });
          self.callback = callback;
          self.dom.modal("show");
        },
        close() {
          self.dom.modal("hide");
          self.app.password = "";
        },
        submit() {
          this.error = "";
          Promise.resolve()
            .then(() => {
              const {checkNumber} = NKC.methods.checkData;
              let {password, number, kcbOnce} = self.app;
              checkNumber(number, {
                name: "转账金额",
                min: 0.01,
                fractionDigits: 2
              });
              number = parseInt(number * 100);
              if(number > kcbOnce) throw `转账金额不能超过${kcbOnce/100}kcb`;
              if(!password) throw "请输入密码";
              return nkcAPI(`/u/${self.app.tUid}/transfer`, "POST", {
                password,
                number
              });
            })
            .then(() => {
              sweetSuccess("转账成功");
              self.close();
            })
            .catch(data => {
              self.app.error = data.error || data;
            });
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }
}