
/*function initLocation() {
	$.getJSON('/sql_areas.json',function(data){
		for (var i = 0; i < data.length; i++) {
			var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
			data[i] = area;
		}
		for(var i = 0; i < addresses.length; i++) {
			$('#drop'+i).chineseRegion('source',data);
			$('#location'+i).val($('#location'+i).attr('data'));
		}
	});
}*/

/*var dropdownHtml = $('#dropdown').html();
function dropElement(id, value) {
	var element = $(dropdownHtml);
	element.attr('id', 'drop'+id);
	element.children('input').attr({
		'id': 'location'+id,
		'data': value
	});
	return element;
}*/
var data = NKC.methods.getDataById("data");

var addresses = data.addresses || [];
var uid = data.user.uid;

function addAddressElement(obj, i) {
	var html = $('.template').html();
	var div = newElement('div', {}, {}).html(html);
	div.find('.addressNumber').text(i+1);
	div.find('.location').val(obj.location).attr('id', 'location'+i);
	div.find('.address').val(obj.address).attr('id', 'address'+i);
	div.find('.mobile').val(obj.mobile).attr('id', 'mobile'+i);
	div.find('.bankName').val(obj.bankName).attr('id', 'bankName'+i);
	div.find('.bankCardNumber').val(obj.bankCardNumber).attr('id', 'bankCardNumber'+i);
	div.find('.alipay').val(obj.alipay).attr('id', 'alipay'+i);
	div.find('.username').val(obj.username).attr('id', 'username'+i);
	div.find('button.btn.btn-danger').attr('data-i', i);
	div.find('.accountHolder').val(obj.accountHolder).attr('id', 'accountHolder'+i);
	div.find('.alipayHolder').val(obj.alipayHolder).attr('id', 'alipayHolder'+i);
	return div;
}

function displayAddress() {
	var addressDiv = $('#addressDiv');
	addressDiv.html('');
	for(var i = 0; i < addresses.length; i++) {
		addressDiv.append(addAddressElement(addresses[i], i));
	}
	$(".location").click(function (e) {
		SelCity(this,e);
	});
	$('button.btn.btn-danger').on('click', function() {
		var i = $(this).attr('data-i');
		nkcAPI('/u/'+uid+'/settings/transaction', 'PATCH', {operation: 'deleteAddress', number: i})
			.then(function(){
				window.location.reload();
			})
			.catch(function(data){
				screenTopWarning(data.error||data);
			})
	})
}

function addAddress() {
	load();
	var obj = {
		username: '',
		address: '',
		mobile: ''
	};
	addresses.push(obj);
	displayAddress();
}


function load() {
	var reg = /^[0-9]*$/;
	for(var i = 0; i < addresses.length; i++) {
		addresses[i].location = $('#location'+i).val();
		addresses[i].address = $('#address'+i).val();
		var mobile = $('#mobile'+i).val();
		if(!reg.test(mobile)) {
			throw '电话号码格式不正确';
		}
		addresses[i].mobile = mobile;
		addresses[i].username = $('#username'+i).val();
		addresses[i].alipay = $('#alipay'+i).val();
		addresses[i].bankName = $('#bankName'+i).val();
		addresses[i].bankCardNumber = $('#bankCardNumber'+i).val();
		addresses[i].accountHolder = $('#accountHolder'+i).val();
		addresses[i].alipayHolder = $('#alipayHolder'+i).val();
	}
}

$(function() {
	displayAddress();
});


function submit(uid) {
	try {
		load();
	} catch(err) {
		return screenTopWarning(err);
	}
	var obj = {
		addresses: addresses
	};
	nkcAPI('/u/'+uid+'/settings/transaction', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}


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