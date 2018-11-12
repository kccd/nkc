$(document).ready(function(){

	var qrcode = geid('userCode');
	if(qrcode) {
		var path = window.location.href;
		path = path.replace(/\?.*/g, '');
		QRCode.toCanvas(qrcode, path, {
			scale: 3,
			margin: 1,
			color: {dark: '#000000'}
		}, function(err) {
			if(err){
				screenTopWarning(err);
			}
		})
	}

});