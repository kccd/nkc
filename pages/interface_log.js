function submit() {
	var uid = $('input[name="uid"]').val();
	var ip = $('input[name="ip"]').val();
	var timeObj = loadTime();
	var begin = timeObj.begin;
	var end = timeObj.end;
	var url = '/log';
	if(uid !== '') {
		url = url==='/log'? url+'?uid='+uid: url+'&uid='+uid;
	}
	if(ip !== '') {
		url = url==='/log'? url+'?ip='+ip: url+'&ip='+ip;
	}
	if(begin) {
		url = url==='/log'? url+'?begin='+begin: url+'&begin='+begin;
	}
	if(end) {
		url = url==='/log'? url+'?end='+end: url+'&end='+end;
	}
	// window.location.href = url;
	openToNewLocation(url);
}

function loadTime() {
	var timeArr = $('#time input');
	var time = [];
	for(var i = 0; i < timeArr.length; i++) {
		var num = timeArr.eq(i).val();
		num = parseInt(num);
		time.push(num);
	}
	var begin, end;
	if(time.length !== 0) {
		var beginTime = new Date(time[0], time[1]-1, time[2]);
		var endTime = new Date(time[3], time[4]-1, time[5]);
		begin = beginTime.getTime();
		end = endTime.getTime();
	}
	return {
		begin:begin,
		end:end
	}
}
function deleteLog() {
	if(!confirm('确定要执行删除操作？')) {
		return screenTopWarning('操作已取消。');
	}

	var timeObj = loadTime();
	var begin = timeObj.begin;
	var end = timeObj.end;
	var url = '/log?';
	if(!begin) {
		return screenTopWarning('请输入起始时间。');
	} else {
		url += 'begin='+begin;
	}
	if(!end) {
		return screenTopWarning('请输入结束时间。');
	} else {
		url += '&end='+end;
	}
	var fn = $('#deleteLog').attr('onclick');
	$('#deleteLog').attr('onclick', '').text('删除中，请稍后...').addClass('disabled');
	nkcAPI(url, 'DELETE', {})
		.then(function() {
			window.location.reload();
			$('#deleteLog').attr('onclick', fn).text('通过日期删除').removeClass('disabled');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
			$('#deleteLog').attr('onclick', fn).text('通过日期删除').removeClass('disabled');
		})
}