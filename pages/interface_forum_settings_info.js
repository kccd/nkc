$('#color').minicolors({

	control: $(this).attr('data-control') || 'hue',

	defaultValue: $(this).attr('data-defaultValue') || '',

	inline: $(this).attr('data-inline') === 'true',

	letterCase: $(this).attr('data-letterCase') || 'lowercase',

	opacity: $(this).attr('data-opacity'),

	position: $(this).attr('data-position') || 'bottom left',

	change: function(hex, opacity) {

		if( !hex ) return;

		if( opacity ) hex += ', ' + opacity;

		try {

			// console.log(hex);

		} catch(e) {}

	},

	theme: 'bootstrap'

});

function toEditor(fid) {
	window.location.href = '/editor?type=forum_declare&id='+fid;
}


function submit(fid, fn) {
	var obj = {
		displayName: $('#displayName').val(),
		abbr: $('#abbr').val(),
		color: $('#color').val(),
		description: $('#description').val(),
		brief: $('#brief').val(),
		basicThreadsId: $('#basicThreadsId').val(),
		noticeThreadsId: $('#noticeThreadsId').val(),
		valuableThreadsId: $('#valuableThreadsId').val(),
		moderators: $('#moderators').val()
	};
	nkcAPI('/f/'+fid+'/settings/info', 'PATCH', obj)
		.then(function() {
			if(fn) {
				fn(fid);
			} else {
				screenTopAlert('保存成功');
			}
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}