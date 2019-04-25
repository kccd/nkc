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
  var visitorThreadList = $('input[name="visitor"]');
  visitorThreadList = visitorThreadList.eq(0).is(":checked")?"latest": "recommend";
  nkcAPI('/e/settings/home/list', 'PATCH', {
    topic: topic,
    discipline: discipline,
    visitorThreadList: visitorThreadList
  })
  .then(function() {
    screenTopAlert('保存成功');
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  });
}
var vueDom = document.getElementById("app");
if(vueDom) {
  var app = new Vue({
    el: '#app',
    data: {
      homeSettings: '',
      info: '',
      list: [],
      error: ""
    },
    mounted: function() {
      var data = getDataById("data");
      this.homeSetting = data.homeSettings;
      if(this.homeSetting.list.topic) {
        this.list.push("topic");
      }
      if(this.homeSetting.list.discipline) {
        this.list.push("discipline");
      }
    },
    methods: {
      save: function() {
        this.error = "";
        this.info = "";
        var homeSettings = this.homeSettings;
        var list = this.list;
        if(list.indexOf('topic') !== -1) {
          homeSettings.list.topic = true;
        }
        if(list.indexOf("discipline") !== -1) {
          homeSettings.list.discipline = true;
        }
        nkcAPI('/e/settings/home/list', 'PATCH', {
          topic: homeSettings.list.topic,
          discipline: homeSettings.list.discipline,
          visitorThreadList: homeSettings.visitorThreadList
        })
          .then(function() {
            app.info = "保存成功";
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
      }
    }
  });
}