var app = new Vue({
  el: "#app",
  data: {
    alipayAccounts: [],
    user: "",
    account: ""
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.user = data.user;
    this.alipayAccounts = data.alipayAccounts;
  },
  methods: {
    format: NKC.methods.format,
    modifyAccount: function(account) {
      this.account = account;
    },
    post: function(data) {
      return nkcAPI("/u/" + app.user.uid + "/settings/alipay", "POST", data);
    },
    setDefault: function(account) {
      var alipayAccounts = this.alipayAccounts;
      for(var i = 0; i < alipayAccounts.length; i++) {
        alipayAccounts[i].default = false;
      }
      account.default = true;
      this.saveAccounts();
    },
    deleteAccount: function(account) {
      var data = {
        type: "deleteAccount",
        account: {
          account: account.account,
          name: account.name
        }
      };
      this.post(data)
        .then(function() {
          var index = app.alipayAccounts.indexOf(account);
          app.alipayAccounts.splice(index, 1);
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    addAccount: function() {
      for(var i = 0; i < this.alipayAccounts.length; i++) {
        if(!this.alipayAccounts[i].time) return;
      }
      var newAccount = {};
      if(!this.alipayAccounts.length) {
        newAccount.default = true;
      }
      this.alipayAccounts.push(newAccount);
      this.account = newAccount;
    },
    saveAccounts: function() {
      var data = {
        type: "saveAccounts",
        accounts: this.alipayAccounts
      };
      this.post(data)
        .then(function(data) {
          app.alipayAccounts = data.alipayAccounts;
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    cancelAccounts: function(bank) {
      if(bank.time) {
        return this.account = "";
      }
      var index = this.alipayAccounts.indexOf(bank);
      this.alipayAccounts.splice(index, 1);
    }
  }
});