var data = NKC.methods.getDataById("data");
var SelectAddress = new NKC.modules.SelectAddress();
var app = new Vue({
  el: "#app",
  data: {
    alipayAccounts: data.alipayAccounts || [],
    addresses: data.addresses || [],
    bankAccounts: data.bankAccounts || [],
    user: data.user,
    account: "",
    accountBank: ""
  },
  methods: {
    format: NKC.methods.format,
    selectAddress: function(address) {
      SelectAddress.open(function(d) {
        address.location = d.join(" ");
      }, {
        onlyChina: true
      });
    },
    addAddress: function() {
      this.addresses.push({
        location: "",
        address: "",
        username: "",
        mobile: ""
      })
    },
    remove: function(index) {
      this.addresses.splice(index, 1);
      this.save("remove");
    },
    save: function(type) {
      var addresses = this.addresses;
      nkcAPI("/u/" + this.user.uid + "/settings/transaction", "PUT", {
        addresses: addresses
      })
        .then(function() {
          if(type !== "remove") sweetSuccess("保存成功");
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    modifyAccount: function(account) {
      this.account = account;
    },
    modifyBankAccount: function(account) {
      this.accountBank = account;
    },
    post: function(data) {
      return nkcAPI("/u/" + this.user.uid + "/settings/alipay", "POST", data);
    },
    postBank: function(data) {
      return nkcAPI("/u/" + app.user.uid + "/settings/bank", "POST", data);
    },
    setDefault: function(account) {
      var alipayAccounts = this.alipayAccounts;
      for(var i = 0; i < alipayAccounts.length; i++) {
        alipayAccounts[i].default = false;
      }
      account.default = true;
      this.saveAccounts();
    },
    setDefaultBank: function(account) {
      var bankAccounts = this.bankAccounts;
      for(var i = 0; i < bankAccounts.length; i++) {
        bankAccounts[i].default = false;
      }
      account.default = true;
      this.saveBankAccounts();
    },
    deleteAccount: function(account) {
      this.post({
        type: "deleteAccount",
        account: {
          account: account.account,
          name: account.name
        }
      })
        .then(function() {
          var index = app.alipayAccounts.indexOf(account);
          app.alipayAccounts.splice(index, 1);
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    deleteBankAccount: function(account) {
      this.postBank({
        type: "deleteAccount",
        account: {
          account: account.account,
          name: account.name
        }
      })
        .then(function() {
          var index = app.bankAccounts.indexOf(account);
          app.bankAccounts.splice(index, 1);
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
    addAccountBank: function() {
      for(var i = 0; i < this.bankAccounts.length; i++) {
        if(!this.bankAccounts[i].time) return;
      }
      var newAccount = {};
      if(!this.bankAccounts.length) {
        newAccount.default = true;
      }
      this.bankAccounts.push(newAccount);
      this.accountBank = newAccount;
    },
    saveAccounts: function() {
      this.post({
        type: "saveAccounts",
        accounts: this.alipayAccounts
      })
        .then(function(data) {
          app.alipayAccounts = data.alipayAccounts;
        })
        .catch(function(err) {
          screenTopWarning(err);
        })
    },
    saveBankAccounts: function() {
      this.postBank({
        type: "saveAccounts",
        accounts: this.bankAccounts
      })
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
      var index = this.alipayAccounts.indexOf(bank);
      this.alipayAccounts.splice(index, 1);
    },
    cancelBankAccounts: function(bank) {
      if(bank.time) {
        return this.accountBank = "";
      }
      var index = this.bankAccounts.indexOf(bank);
      this.bankAccounts.splice(index, 1);
    }
  }
});

Object.assign(window, {
  SelectAddress,
  app,
});
