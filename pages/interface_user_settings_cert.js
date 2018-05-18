$(function() {
	initEvent('cert');
});

function initEvent(elementId) {
	$('#'+elementId).on('change', function() {
		var files = $('#'+elementId)[0].files;
		uploadLifePhotos(files, 0);
	});
}

function uploadLifePhotos(files, i) {
	$('#photoInfo').text((i+1) + '/' + files.length);
	var file = files[i];
	var formData = new FormData();
	formData.append('file', file);
	formData.append('photoType', 'cert');
	postUpload('/photo', formData, function() {
		i++;
		if(i <= (files.length-1)) {
			uploadLifePhotos(files, i);
		} else {
			window.location.reload();
		}
	});
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

function submit(uid) {
	var optionArr = [];
	var displayPhoto = 0;
	var arr = $('#certPhotoSelect option');
	for(var i = 0; i < arr.length; i++) {
		optionArr.push({
			data: arr.eq(i).attr('data'),
			text: arr.eq(i).text()
		});
	}
	var select = $('#certPhotoSelect');
	for(var i = 0; i < optionArr.length; i++) {
		if(select.val() === optionArr[i].text) {
			displayPhoto = optionArr[i].data;
			break;
		}
	}
	nkcAPI('/u/'+uid+'/settings/cert', 'PATCH', {displayPhoto: displayPhoto})
		.then(function(){
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}