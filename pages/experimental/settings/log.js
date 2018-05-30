let data = $('#data').text();
let types;
if(data) {
	data = JSON.parse(data);
  types = data.types;
}

$('input[name="selectLogSettings"]').iCheck({
	checkboxClass: 'icheckbox_minimal-red',
});


function saveLogSettings(){
  // return console.log(getSelectedLogSettings())
  let logParams = getSelectedLogSettings()
  nkcAPI('/e/settings/log', 'POST', {logParams:logParams})
  .then(function() {
    window.location.reload();
  })
  .catch(function(data) {
    screenTopAlert(data.error || data);
  })
}

function getSelectedLogSettings() {
	let arr = $('input[name="selectLogSettings"]');
	let operations = [];
	for(let i = 0; i < arr.length; i++) {
		let e = arr.eq(i);
		if(e.prop('checked')) {
			operations.push(e.attr('data-operation'));
		}
	}
	return operations;
}
