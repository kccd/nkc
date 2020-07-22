var targetUid = $('.photoType').attr('targetUid');
$(function(){
	var radioName = [];
	var arr = $('.photoType');
	for(var i = 0; i < arr.length; i++){
		var name = arr.eq(i).attr('name');
		radioName.push(name);
		displayInput(name);
		disappearInput(name);
		submit(name);
	}
});
function displayInput(name) {
	$('input[name='+name+']').eq(1).on('click', function() {
		$('#'+name+'Reason').show();
		$('#'+name+'Time').hide();
	})
}

function disappearInput(name) {
	$('input[name='+name+']').eq(0).on('click', function() {
		$('#'+name+'Reason').hide();
		$('#'+name+'Time').show();
	})
}

function submit(name){
	$('#'+name+'Submit').on('click', function() {
		var status, time = null;
		var reason = $('#'+name+'Reason').val();
		var timeArr = $('#'+name+'Time input');
		var year = timeArr.eq(0).val();
		var month = timeArr.eq(1).val();
		var day = timeArr.eq(2).val();
		var chooseTrue = $('input[name='+name+']').eq(0).is(':checked');
		var chooseFalse = $('input[name='+name+']').eq(1).is(':checked');
		if(!chooseFalse && !chooseTrue) {
			return screenTopWarning('请选择同意或不同意后再点击提交!');
		}
		if(chooseFalse) {
			status = false;
			if(reason === '') {
				return screenTopWarning('请输入原因！');
			}
		} else {
			status = true;
			reason = '';
			if(year === '' || month === '' || day === '') {
				return screenTopAlert('请输入正确的时间！');
			}
			time = new Date(year + ' ' + month + ' ' + day);
			if(!time) return screenTopWarning('请输入正确的时间！');
		}
		nkcAPI('/auth/'+targetUid, 'PUT', {reason: reason, status: status, type: name, time: time})
			.then(function(){
				screenTopAlert('提交成功！');
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	});
}
