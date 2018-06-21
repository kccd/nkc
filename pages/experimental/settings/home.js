function saveAdsOrder() {
	var arr = $('input[name="threadOrder"]');
	var orders = [];
	var ads = [];
	for(var i = 0; i < arr.length; i++) {
		var tid = arr.eq(i).attr('data-tid');
		var order = arr.eq(i).val();
		order = parseInt(order);
		if(orders.length === 0) {
			orders.push(order);
			ads.push(tid);
		} else {
			let pushed = false;
			for(var j = 0; j < orders.length; j++) {
				if(orders[j] > order) {
					orders.splice(j, 0, order);
					ads.splice(j, 0, tid);
					pushed = true;
					break;
				}
			}
			if(!pushed) {
				orders.push(order);
				ads.push(tid);
			}
		}
	}
	nkcAPI('/e/settings/home/top', 'PATCH', {operation: 'modifyOrder', ads: ads})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}


var jcropApi;
var imgM = $('#img_m');
var imgS = $('#img_s');
var imgMWeight = 250;
var imgSWeight = 48;
var imgWeight = 0;
var positionObj;
var hasImg = false;
var upLoadFile;
var TOP,LEFT, WIDTH, HEIGHT;
function init() {
	hasImg = true;
	positionObj = undefined;
	$('#element_id').Jcrop({
		aspectRatio: 1,
		onChange: updatePreview,
		minSize: [50,50],
		onSelect: updatePreview,
	}, function() {
		jcropApi = this;
	});
}

$('#inputFile').on('change', function() {
	var file = $('#inputFile')[0].files[0];
	if(file) {
		upLoadFile = file;
	}
	var reader = new FileReader();
	reader.onload = function() {
		var url = reader.result;
		displayAvatar(url);
	};
	reader.readAsDataURL(upLoadFile)
});

function displayAvatar(url) {
	var html = '<img src="'+url+'" style="width: 100%" id="element_id">';
	$('.user-settings-img-dev').html(html);
	$('#img_s').attr('src', url);
	$('#img_m').attr('src', url);
	init()
}

function updatePreview() {
	var obj = jcropApi.tellSelect();
	imgWeight = jcropApi.getWidgetSize()[0];
	var imgMBgImgWeight = imgMWeight * imgWeight / obj.w;
	var imgSBgImgWeight = imgSWeight * imgWeight / obj.w;
	imgMBgImgTop = -obj.y * imgMBgImgWeight / imgWeight;
	imgMBgImgLeft = -obj.x * imgMBgImgWeight / imgWeight;
	TOP = -1*imgMBgImgTop;
	LEFT = -1*imgMBgImgLeft;
	WIDTH = imgMBgImgWeight;
	imgM.css({
		width: imgMBgImgWeight,
		height: 'auto',
		top: imgMBgImgTop,
		left: imgMBgImgLeft
	});
	HEIGHT = imgM.height();
	imgSBgImgTop = -obj.y * imgSBgImgWeight / imgWeight;
	imgSBgImgLeft = -obj.x * imgSBgImgWeight / imgWeight;
	imgS.css({
		width: imgSBgImgWeight,
		height: 'auto',
		top: imgSBgImgTop,
		left: imgSBgImgLeft
	});
}

function submit() {
	if(!hasImg) {
		return screenTopWarning('请选择图片');
	}
	positionObj = jcropApi.tellSelect();
	if(!positionObj || positionObj.w === 0 || positionObj.h === 0) {
		return screenTopWarning('请选择裁剪区域');
	}
	var formData = new FormData();
	formData.append('file', upLoadFile);
	formData.append('position', JSON.stringify({top: TOP, left: LEFT, width: WIDTH, height: HEIGHT}));
	$.ajax({
		url: '/logo',
		method: 'POST',
		cache: false,
		data: formData,
		headers: {
			'FROM': 'nkcAPI'
		},
		dataType: 'json',
		contentType: false,
		processData: false,
	})
		.done(function() {
			window.location.reload();
		})
		.fail(function(data) {
			screenTopWarning(JSON.parse(data.responseText).error);
		})
}

function defaultLogo(id) {
	nkcAPI('/e/settings/home/logo', 'PATCH', {id: id})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function deleteLogo(id) {
	nkcAPI('/e/settings/home/logo?id='+ id, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function saveNotice() {
	var value = $('#threadId').val();
	var arr = value.split(',');
	nkcAPI('/e/settings/home/notice', 'PATCH', {id: arr})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function removeNotice(oc) {
	nkcAPI('/e/settings/home/notice?oc='+oc, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}