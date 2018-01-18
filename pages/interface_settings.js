var lifePhotoArr = [];
var certsPhotoArr = [];
$(function(){
	init();
	initLifePhoto();
	initCertsPhoto();
});
function init() {
	chooseFile('#idCardAPhoto');
	chooseFile('#idCardBPhoto');
	chooseFile('#handheldIdCardPhoto');
	chooseFile('#lifePhoto');
	chooseFile('#certsPhoto');
}

function chooseFile(id) {
	$(id).on('change', function() {
		var files = $(id).get(0).files;
		var length = files.length;
		if(length === 0) return;
		var text = '<span>已选择图片</span><br>';
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			text += '<span>文件名：'+file.name+' <br> 文件大小：'+outSize(file.size)+'</span><br>'
			// text += '<h5>文件名：'+file.name+'</h5>';
			// text += '<h5>大小：'+outSize(file.size)+'</h5>'
		}
		$(id+'Messages').html(text);
	})
}

function uploadFile(id){
	var files = $(id).get(0).files;
	var length = files.length;
	if(length === 0) {
		return screenTopAlert('未选择任何图片！')
	}
	if(length === 1 && (id === '#idCardAPhoto' || id === '#idCardBPhoto') || id === '#handheldIdCardPhoto') {
		var file = files[0];
		var formData = new FormData();
		formData.append('file', file);
		formData.append('photoType', id);
		postUpload('/photo', formData, uploadSuccess)
	} else {
		var n = 1;
		var funSuccess = function(data) {
			n++;
			var id = data.photoId;
			var photoType = data.photoType;
			if(n > length) {
				$(photoType+'Messages').html($(photoType+'Messages').html() + '<h5>上传成功！</h5>');
			}
			if(photoType === '#lifePhoto'){
				lifePhotoArr.push(id);
				displayLifePhoto();
			} else if(photoType === '#certsPhoto') {
				certsPhotoArr.push(id);
				displayCertsPhoto();
			}
		};
		var fun = function(files, index) {
			if(files.length <= index) return;
			var file = files[index];
			var formData = new FormData();
			formData.append('file', file);
			formData.append('photoType', id);
			postUpload('/photo', formData, function(data){funSuccess(data);fun(files, (index+1))})
		};
		fun(files, 0);
	}
}


function outSize(num) {
	var size = num/1024; // kb
	if(size >= 1024) {
		size = (size/1024).toFixed(2);
		return size+' M';
	} else {
		size = size.toFixed(1);
		return size+' KB';
	}
}

function uploadSuccess(data) {
	window.location.reload();
	/*var id = data.photoId;
	var photoType = data.photoType;
	$(photoType).val('');
	$(photoType+'Display').attr('src', '/photo_small/'+id);
	$(photoType+'Remove').attr('onclick', 'removePhoto('+id+')');
	$(photoType+'Remove').removeClass('disabled');
	$(photoType+'Messages').html($(photoType+'Messages').html() + '<h5>上传成功！</h5>');*/
}

function initLifePhoto() {
	var imgArr = $('#lifePhotoDisplay div img');
	for(let i = 0; i < imgArr.length; i++) {
		var id = imgArr.eq(i).attr('photoId');
		if(!lifePhotoArr.includes(id)) {
			lifePhotoArr.push(id);
		}
	}
}

function displayCertsPhoto(){
	var text = '';
	if(certsPhotoArr.length === 0) {
		text = '<div class="blank" style="height: 20rem;line-height: 20rem">暂无数据</div>'
	} else {
		for (let id of certsPhotoArr) {
			text += '<div class="col-xs-12 col-md-4"><div class="settings-img-remove glyphicon glyphicon-remove" onclick="removePhoto('+id+')")></div><img src="/photo_small/'+id+'" photoId="'+id+'"></div>';
		}
	}
	$('#certsPhotoDisplay').html(text);
}

function displayLifePhoto() {
	var text = '';
	if(lifePhotoArr.length === 0) {
		text = '<div class="blank" style="height: 20rem;line-height: 20rem">暂无数据</div>'
	} else {
		for (let id of lifePhotoArr) {
			text += '<div class="col-xs-12 col-md-4"><div class="settings-img-remove glyphicon glyphicon-remove" onclick="removePhoto('+id+')")></div><img src="/photo_small/'+id+'" photoId="'+id+'"></div>';
		}
	}
	$('#lifePhotoDisplay').html(text);
}

function initCertsPhoto() {
	var imgArr = $('#certsPhotoDisplay div img');
	for(let i = 0; i < imgArr.length; i++) {
		var id = imgArr.eq(i).attr('photoId');
		if(!certsPhotoArr.includes(id)) {
			certsPhotoArr.push(id);
		}
	}
}


function removePhoto(id) {
	nkcAPI('/photo/'+id, 'DELETE', {})
		.then(function(data) {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		});
}

function submitAuth(number) {
	nkcAPI('/auth', 'POST', {number: number})
		.then(function(data) {
			screenTopAlert('提交成功，请耐心等待审核。');
			setTimeout(function(){window.location.reload()}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function unSubmitAuth(uid, number) {
	nkcAPI('/auth/'+uid+'?number='+number, 'DELETE',{})
		.then(function(data) {
			screenTopAlert('撤销成功！');
			setTimeout(function(){window.location.reload()}, 2000)
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}