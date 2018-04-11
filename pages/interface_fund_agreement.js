var fnString = $('#submit').attr('onclick');
$('#submit').attr('onclick', '');
$('input[type="radio"]').on('click', function() {
	var arr = $('input[type="radio"]');
	if(arr.eq(0).is(':checked')) {
		$('#submit').removeClass('disabled').addClass('btn-info').attr('onclick', fnString);
	} else {
		$('#submit').addClass('disabled').removeClass('btn-info').attr('onclick', '');
	}
});


function submit(id) {
	nkcAPI('/fund/list/'+id+'/add', 'POST', {})
		.then(function(data) {
			window.location.href = '/fund/a/'+data.applicationForm._id+'/settings';
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}