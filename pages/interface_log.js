var uid, ip, time, type, url = '/log';
$(function(){
	load();
});


function load() {
	var type = $('select option:selected').val();
	url += '?type='+type;
	switch (type) {
		case 'uid': {
			var uid = $('#uid').val();
			if(uid === '') return screenTopWarning('请输入用户uid。');
			url += '$uid='+uid;
			break;
		}
		case 'ip': {
			var ip = $('#ip').val();
			if(ip === '') return screenTopWarning('请输入ip地址。');
			url += '$ip='+ip;
			break;
		}
		case 'time': {
			var arr = $('#time input');
		}
	}
}

