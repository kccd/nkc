var jcropApi;
var imgM = $('#img_m');
var imgMWeight = 96;
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

$('#logo').on('change', function() {
	var file = $('#logo')[0].files[0];
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
	$('#img_m').attr('src', url);
	init()
}

function updatePreview() {
	var obj = jcropApi.tellSelect();
	imgWeight = jcropApi.getWidgetSize()[0];
	var imgMBgImgWeight = imgMWeight * imgWeight / obj.w;
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
}

function submit(fid) {
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
		url: '/forum_avatar/'+fid,
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
}

function uploadBanner(fid) {
  var input = $("input[name='banner']")[0];
  var files = input.files;
  if(!files || files.length === 0) return screenTopWarning("请选择banner图片");
  var formData = new FormData();
  formData.append("file", files[0]);
  uploadFilePromise("/f/" + fid + "/banner", formData, function(){}, "PATCH")
    .then(function() {
      screenTopAlert('保存成功');
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}