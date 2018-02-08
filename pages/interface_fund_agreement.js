$('input[type="radio"]').on('click', function() {
	var arr = $('input[type="radio"]');
	if(arr.eq(0).is(':checked') && arr.eq(2).is(':checked')) {
		$('#submit').removeClass('disabled');
	} else {
		$('#submit').addClass('disabled');
	}
});