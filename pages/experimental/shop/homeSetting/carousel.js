var positionObj;
var hasImg = false;
var upLoadFile;
function init() {
	hasImg = true;
	positionObj = undefined;
}

$('#imageUpload').on('change', function() {
	var file = $('#imageUpload')[0].files[0];
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
	var html = '<img src="'+url+'" style="width: 100%;height:180px">';
	$('#imgDom').html(html);
	init()
}

function submit() {
	if(!hasImg) {
		return screenTopWarning('请选择图片');
	}
  var formData = new FormData();
  var targetUrl = $("#carouselLink").val();
  if(!targetUrl) return screenTopWarning("请填写轮播图指向url");
  formData.append('file', upLoadFile);
  formData.append('targetUrl', targetUrl);
	$.ajax({
		url: '/e/settings/shop/homeSetting/carousel',
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
      window.location.reload();
		})
		.fail(function(data) {
			screenTopWarning(JSON.parse(data.responseText).error);
		})
}

function delCarousel(index) {
  nkcAPI('/e/settings/shop/homeSetting/carousel', 'PATCH', {index:index})
  .then(function(data) {
    screenTopAlert("删除成功");
    window.location.reload();
  })
  .catch(function(data) {
    screenTopWarning(data | data.error)
  })
}