
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
var data = JSON.parse($('#data').text());
var addresses = data.addresses || [];

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


function addAddressElement(obj, i) {
	var addressList = $('<div class="address-list"></div>');
	var sm3 = $('<div class="col-sm-3"></div>');
	var sm5_ = $('<div class="col-sm-5"></div>');// Object.assign({}, sm4);
	var sm2 = $('<div class="col-sm-2"></div>');
	var sm2_ = $('<div class="col-sm-2"></div>');
	var mobileInput = $('<input class="form-control" id="mobile'+i+'" placeholder="联系电话" value="'+obj.mobile+'">');
	sm3.append(mobileInput);
	var addressInput = $('<input class="form-control" id="address'+i+'" placeholder="详细地址" value="'+obj.address+'">');
	sm5_.append(addressInput);
	var nameInput = $('<input class="form-control" id="username'+i+'" placeholder="收件人" value="'+obj.username+'">');
	sm2.append(nameInput);
	var deleteBtn = $('<button class="btn btn-danger" onclick="deleteAddress('+i+')">删除</button>');
	sm2_.append(deleteBtn);
	addressList.append(sm5_);
	addressList.append(sm3);
	addressList.append(sm2);
	addressList.append(sm2_);
	return addressList;
}

function displayAddress() {
	var addressDiv = $('#address-div');
	addressDiv.html('');
	for(var i = 0; i < addresses.length; i++) {
		addressDiv.append(addAddressElement(addresses[i], i));

	}
	// initLocation();
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

function deleteAddress(i) {
	load();
	addresses.splice(i, 1);
	displayAddress();
}

function load() {
	var reg = /^[0-9]*$/;
	for(var i = 0; i < addresses.length; i++) {
		addresses[i].address = $('#address'+i).val();
		var mobile = $('#mobile'+i).val();
		if(!reg.test(mobile)) {
			throw '电话号码格式不正确';
		}
		addresses[i].mobile = mobile;
		addresses[i].username = $('#username'+i).val();
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