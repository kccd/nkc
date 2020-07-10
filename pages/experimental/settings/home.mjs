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
	var waterLimitMinWidth = $("#waterLimitMinWidth").val();
  var waterLimitMinHeight = $("#waterLimitMinHeight").val();
	nkcAPI('/e/settings/home/logo', 'PATCH', {
		watermarkTransparency: watermarkTransparency,
    waterLimitMinWidth: parseInt(waterLimitMinWidth),
    waterLimitMinHeight: parseInt(waterLimitMinHeight),
		operation: 'saveWaterMarkSettings'
	})
		.then(function() {
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error|| data);
		})
}


function uploadHomeBigLogo(files) {
	var form = new FormData();
	files.forEach(function(file, index){
		form.append('file' + index, file);
	})
	return nkcUploadFile("/e/settings/home/list/biglogo", "POST", form);
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
      recommend: [],
			error: "",
			logoFiles: [],
			logoFileUploadding: false
    },
    beforeMount: function() {
      var data = NKC.methods.getDataById("data");
      if(data.homeSettings.list.topic) {
        this.list.push("topic");
      }
      if(data.homeSettings.list.discipline) {
        this.list.push("discipline");
      }
      if(data.homeSettings.recommend.featuredThreads) {
        this.recommend.push("featuredThreads")
      }
      if(data.homeSettings.recommend.hotThreads) {
        this.recommend.push("hotThreads")
			}
			this.homeSettings = data.homeSettings;
			if(data.homeBigLogo) {
				this.logoFiles = this.logoFiles.concat(data.homeBigLogo);
			}
    },
    methods: {
      save: function() {
        this.error = "";
        this.info = "";
        var homeSettings = this.homeSettings;
        var list = this.list;
        homeSettings.list.topic = false;
        homeSettings.list.discipline = false;
        if(homeSettings.hotThreads.postCount < 0) return this.error = "热门文章最小回复数不能小于0";
        if(homeSettings.hotThreads.postUserCount < 0) return this.error = "热门文章最小回复用户总数不能小于0";
        var recommend = this.recommend;
        homeSettings.recommend.hotThreads = false;
        homeSettings.recommend.featuredThreads = false;

        if(recommend.indexOf("hotThreads") !== -1) homeSettings.recommend.hotThreads = true;
        if(recommend.indexOf("featuredThreads") !== -1) homeSettings.recommend.featuredThreads = true;
        if(homeSettings.recommend.voteUpTotal < 0) return this.error = "推荐条件中点赞总数不能小于0";
        if(homeSettings.recommend.voteUpMax < 0) return this.error = "推荐条件中独立点赞数不能小于0";
        if(homeSettings.recommend.encourageTotal < 0) return this.error = "推荐条件中鼓励次数不能小于0";
        if(list.indexOf('topic') !== -1) {
          homeSettings.list.topic = true;
        }
        if(list.indexOf("discipline") !== -1) {
          homeSettings.list.discipline = true;
        }
        nkcAPI('/e/settings/home/list', 'PATCH', {
          topic: homeSettings.list.topic,
          discipline: homeSettings.list.discipline,
          visitorThreadList: homeSettings.visitorThreadList,
          hotThreads: homeSettings.hotThreads,
          recommend: homeSettings.recommend
        })
          .then(function() {
          	sweetSuccess('保存成功');
          })
          .catch(function(data) {
            app.error = data.error || data;
          });
			},
			pickPicture: function() {
				$("#inputFile").click();
			},
			addFile: function() {
				var self = this;
				var files = [].slice.call($("#inputFile")[0].files);
				self.logoFileUploadding = true;
				uploadHomeBigLogo(files)
					.then(function(data){
						self.logoFiles = self.logoFiles.concat(data.saved);
						self.logoFileUploadding = false;
					})
				$("#inputFile").val("");
			},
			deleteBigLogo: function(index) {
				let logoFiles = this.logoFiles;
				let fileItem = logoFiles[index];
				nkcAPI("/e/settings/home/list/biglogo", "POST", {
					type: "delete",
					aid: fileItem.aid
				})
				.then(function(){
					logoFiles.splice(index, 1);
					screenTopAlert('删除成功');
				})
				.catch(err => {
					screenTopAlert(err.error);
				})
			}
    }
  });
}
