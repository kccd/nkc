function saveAdsOrder() {
	var arr = $('input[name="threadOrder"]');
	var orders = [];
	var ads = [];
	for(var i = 0; i < arr.length; i++) {
		var tid = arr.eq(i).attr('data-tid');
		var order = arr.eq(i).val();
		order = parseInt(order);
		if(orders.length === 0) {
			orders.push(order);
			ads.push(tid);
		} else {
			var pushed = false;
			for(var j = 0; j < orders.length; j++) {
				if(orders[j] > order) {
					orders.splice(j, 0, order);
					ads.splice(j, 0, tid);
					pushed = true;
					break;
				}
			}
			if(!pushed) {
				orders.push(order);
				ads.push(tid);
			}
		}
	}
	nkcAPI('/e/settings/home/top', 'PATCH', {operation: 'modifyOrder', ads: ads})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}



$('#inputFile').on('change', function() {
	var file = $('#inputFile')[0].files[0];
	if(file) {
		upLoadFile = file;
		var formData = new FormData();
		formData.append('file', upLoadFile);
		$.ajax({
			url: '/logo',
			method: 'POST',
			cache: false,
			data: formData,
			headers: {
				'FROM': 'nkcAPI'
			},
			dataType: 'json',
			contentType: false,
			processData: false,
		})
			.done(function() {
				window.location.reload();
			})
			.fail(function(data) {
				screenTopWarning(JSON.parse(data.responseText).error);
			})
	}
});

function defaultLogo(id, type) {
	nkcAPI('/e/settings/home/logo', 'PATCH', {id: id, type: type, operation: 'saveLogo'})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function deleteLogo(id) {
	nkcAPI('/e/settings/home/logo?id='+ id, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function saveNotice() {
	var value = $('#threadId').val();
	var arr = value.split(',');
	nkcAPI('/e/settings/home/notice', 'PATCH', {id: arr})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function removeNotice(oc) {
	nkcAPI('/e/settings/home/notice?oc='+oc, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function saveWaterMarkSettings() {
	var watermarkTransparency = $('#watermarkTransparency').val();
	nkcAPI('/e/settings/home/logo', 'PATCH', {
		watermarkTransparency: watermarkTransparency,
		operation: 'saveWaterMarkSettings'
	})
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}

function saveHomeListSettings() {
  var inputs = $('input[name="list"]');
  var topic = inputs.eq(0).is(':checked');
  var discipline = inputs.eq(1).is(':checked');
  nkcAPI('/e/settings/home/list', 'PATCH', {
    topic: topic,
    discipline: discipline
  })
  .then(function() {
    screenTopAlert('保存成功');
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  });
}