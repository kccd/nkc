function postUpload(url, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.upload.onprogress = function(e) {
		var percentComplete = (e.loaded / e.total) * 100;
		console.log("Uploaded " + percentComplete + "%");
	};
	xhr.onreadystatechange=function()
	{
		if (xhr.readyState==4)
		{
			if(xhr.status>=200&&xhr.status<300){
				// jalert('上传成功！');
				callback(JSON.parse(xhr.responseText));
			}else {
				jwarning(xhr.status.toString()+' '+xhr.responseText);
			}
		}
	};
	xhr.open("POST",url,true);
	//xhr.setRequestHeader("Content-type","application/json");
	xhr.send(data);
}
function uploadFile(url, id, callback) {
	$(id).on('change', function() {
		var inputFile = $(id).get(0);
		var file;
		if(inputFile.files.length > 0){
			file = inputFile.files[0];
		}else {
			return jwarning('未选择文件');
		}
		var formData = new FormData();
		formData.append('file', file);
		postUpload(url, formData, callback);
	});
}