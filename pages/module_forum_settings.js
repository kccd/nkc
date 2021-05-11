function changeForum (value, type) {
	var arr = $('#module-forum-select option');
	for(var i = 0; i < arr.length; i++) {
		if(arr.eq(i).text() === value) {
			// window.location.href = '/f/'+arr.eq(i).attr('data-fid')+'/settings/'+type;
			openToNewLocation('/f/'+arr.eq(i).attr('data-fid')+'/settings/'+type);
		}
	}
}

window.changeForum = changeForum;