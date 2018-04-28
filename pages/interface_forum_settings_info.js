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

function submit(fid) {
	var obj = {
		displayName: $('#displayName').val(),
		abbr: $('#abbr').val(),
		color: $('#color').val(),
		description: $('#description').val(),
		declare: $('#declare').val()
	};
	nkcAPI('/f/'+fid+'/settings/info', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}