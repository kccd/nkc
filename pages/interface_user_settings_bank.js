var app = new Vue({
  el: "#app",
  data: {
    bankAccounts: [],
    user: "",
    account: ""
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.user = data.user;
    this.bankAccounts = data.bankAccounts;
  },
  methods: {
    format: NKC.methods.format,
    modifyAccount: function(account) {
      this.account = account;
    },
    post: function(data) {
      return nkcAPI("/u/" + app.user.uid + "/settings/bank", "POST", data);
    },
    setDefault: function(account) {
      var bankAccounts = this.bankAccounts;
      for(var i = 0; i < bankAccounts.length; i++) {
        bankAccounts[i].default = false;
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
          var index = app.bankAccounts.indexOf(account);
          app.bankAccounts.splice(index, 1);
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    addAccount: function() {
      for(var i = 0; i < this.bankAccounts.length; i++) {
        if(!this.bankAccounts[i].time) return;
      }
      var newAccount = {};
      if(!this.bankAccounts.length) {
        newAccount.default = true;
      }
      this.bankAccounts.push(newAccount);
      this.account = newAccount;
    },
    saveAccounts: function() {
      var data = {
        type: "saveAccounts",
        accounts: this.bankAccounts
      };
      this.post(data)
        .then(function(data) {
          app.bankAccounts = data.bankAccounts;
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    cancelAccounts: function(bank) {
      if(bank.time) {
        return this.account = "";
      }
      var index = this.bankAccounts.indexOf(bank);
      this.bankAccounts.splice(index, 1);
    }
  }
});