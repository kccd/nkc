function postUpload(url, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.upload.onprogress = function(e) {
		var percentComplete = (e.loaded / e.total) * 100;
		console.log("Uploaded " + percentComplete + "%");
	};
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4)
		{
			if(xhr.status>=200&&xhr.status<300){
				// jalert('上传成功！');
				callback(JSON.parse(xhr.responseText));
			}else {
				screenTopAlert(xhr.status.toString()+' '+xhr.responseText);
			}
		}
	};
	xhr.open("POST",url,true);
	//xhr.setRequestHeader("Content-type","application/json");
	xhr.send(data);
}
function uploadFile(url, id, callback) {
	$(id).on('change', function() {
		var inputFile = $(id).get(0);
		var file;
		if(inputFile.files.length > 0){
			file = inputFile.files[0];
		}else {
			return screenTopAlert('未选择文件');
		}
		var formData = new FormData();
		formData.append('file', file);
		postUpload(url, formData, callback);
	});
}

function userMessagesForm() {
	var obj = {
		name: $('#name').val(),
		idCardNumber: $('#idCardNumber').val(),
		mobile: $('#mobile').val(),
		description: $('#description').val()
	};
	if(obj.name === '') {
		throw '请输入真实姓名！';
	}
	if(obj.idCardNumber === '') {
		throw '请输入身份证号码！';
	}
	if(obj.mobile === '') {
		throw '请输入联系电话！';
	}
	/*if(!obj.idCardNumber.match(/[0-9]{17}[0-9]?|X|x/) || obj.idCardNumber.length > 18) {
		throw '身份证号码格式不正确！';
	}
	*/

	if($('.wechat').length !== 0) {
		if($('.wechat').hasClass('active')) {
			obj.paymentType = 'wechat';
		} else if($('.alipay').hasClass('active')){
			obj.paymentType = 'alipay';
		} else {
			throw '请选择收款方式！';
		}
		obj.account = $('#account').val();
		if(obj.account === '') {
			throw '请输入收款账号！';
		}
	}
	if(obj.description === '') {
		throw '请输入自我介绍';
	}
	return obj;
}