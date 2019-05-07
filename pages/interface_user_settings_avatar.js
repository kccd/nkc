/*
var jcropApi;
var imgM = $('#img_m');
var imgS = $('#img_s');
var imgMWeight = 192;
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

function submit(uid) {
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
		url: '/avatar/'+uid,
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
			screenTopAlert('保存成功');
		})
		.fail(function(data) {
			screenTopWarning(JSON.parse(data.responseText).error);
		})
}*/

moduleCrop.init(function(data) {
  var user = getDataById("data").user;
  var formData = new FormData();
	formData.append("file", data);
  uploadFilePromise('/avatar/' + user.uid, formData, function(e, percentage) {
    $(".upload-info").text('上传中...' + percentage);
    if(e.total === e.loaded) {
      $(".upload-info").text('上传完成！');
      setTimeout(function() {
        $(".upload-info").text('');
      }, 2000);
    }
  }, "POST")
    .then(function() {
      $("#img_l").attr("src", "/avatar/" + user.uid + '?t=lg' + "&time=" + Date.now());
      $("#img_s").attr("src", "/avatar/" + user.uid + '?t=sm' + "&time=" + Date.now());
      $("#img_m").attr("src", "/avatar/" + user.uid + '?time=' + Date.now());
    })
    .catch(function(data) {
      screenTopWarning(data);
    });
}, {
  aspectRatio: 1
});