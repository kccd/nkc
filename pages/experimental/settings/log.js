var data = $('#data').text();
var types;
if(data) {
	data = JSON.parse(data);
  types = data.types;
}

$('input[name="selectLogSettings"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});


function saveLogSettings(){
  // return console.log(getSelectedLogSettings())
  var logParams = getSelectedLogSettings()
  nkcAPI('/e/settings/log', 'POST', {logParams:logParams})
  .then(function() {
    window.location.reload();
  })
  .catch(function(data) {
    screenTopAlert(data.error || data);
  })
}

function getSelectedLogSettings() {
	var arr = $('input[name="selectLogSettings"]');
	var operations = [];
	for(var i = 0; i < arr.length; i++) {
		var e = arr.eq(i);
		if(e.prop('checked')) {
			operations.push(e.attr('data-operation'));
		}
	}
	return operations;
}
