$.getJSON('/location.json',function(data){
	for (var i = 0; i < data.length; i++) {
		var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
		data[i] = area;
	}
	$('.bs-chinese-region').chineseRegion('source',data);
	$('#location').val($('#location').attr('data'));
});

var positionObj;
var hasImg = false;
var upLoadFile;
function init() {
	hasImg = true;
	positionObj = undefined;
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
	var html = '<img src="'+url+'" style="width: 100px;height:100px" id="element_id">';
	$('.user-settings-img-dev').html(html);
	init()
}

function submit(storeId) {
	if(!hasImg) {
		return screenTopWarning('请选择图片');
	}
	var formData = new FormData();
	formData.append('file', upLoadFile);
	$.ajax({
		url: '/shopLogo/'+storeId,
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

function saveToInfo(storeId) {
  var post = {};  
  var storeName = $("#storeName").val().trim();
  var storeDescription = $("#storeDescription").val().trim();;
  var location = $("#location").val().trim();
  var address = $("#address").val().trim();
  if(!storeName || !storeDescription || !location || !address) {
    screenTopWarning("请完善店铺信息后再提交")
    return;
  }
  location = location + address
  post = {
    storeName: storeName,
    storeDescription: storeDescription,
    location: location
  }
  nkcAPI("/shop/manage/"+storeId+"/info", "POST", post)
  .then( function(data){
    screenTopAlert('店铺信息保存成功');
  })
  .catch( function(err){
    screenTopWarning(data || data.error);
  })
}