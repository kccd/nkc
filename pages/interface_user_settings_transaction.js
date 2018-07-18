
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
var uid = data.uid;

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
	var html = $('.template').html();
	var div = newElement('div', {}, {}).html(html);
	div.find('.addressNumber').text(i+1);
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