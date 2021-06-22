function submitBase() {
	var obj = {
    websiteName: $('#websiteName').val(),
    websiteAbbr: $('#websiteAbbr').val(),
		github: $('#github').val(),
		record: $('#record').val(),
		copyright: $('#copyright').val(),
		description: $('#description').val(),
		keywords: $('#keywords').val(),
		brief: $('#brief').val(),
		telephone: $('#telephone').val(),
	};
	nkcAPI('/e/settings/base', 'PUT', obj)
		.then(function() {
			screenTopAlert('保存成功');
			setTimeout(function() {
				window.location.reload();
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
window.submitBase = submitBase;

var app = new Vue({
  el: "#app",
  data: {
    serverSettings: "",
    keywords: "",
    error: "",
    info: "",
    tempSiteIcon: "",
    shouldUploadSiteIcon: false
  },
  mounted: function() {
    var data = NKC.methods.getDataById("data");
    this.serverSettings = data.serverSettings;
    this.keywords = (data.serverSettings.keywords || "").join(",");
    var self = this;
    setTimeout(function() {
      NKC.methods.initSelectColor(function(color) {
        self.serverSettings.backgroundColor = color;
      });
    }, 300)
  },
  methods: {
    save: function() {
      const self = this;
      this.error = "";
      this.info = "";
      var settings = this.serverSettings;
      settings.keywords = this.keywords;
      var input = this.$refs.selectSiteIconInput;
      var file = input.files[0];
      var form = new FormData();
      form.append("siteicon", file);
      form.append("settings", JSON.stringify(settings));
      return nkcUploadFile("/e/settings/base", "PUT", form)
        .then(function() {
          self.shouldUploadSiteIcon = false;
          sweetSuccess("保存成功");
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    },
    remove: function(arr, l) {
      var index = arr.indexOf(l);
      if(index === -1) return;
      arr.splice(index, 1);
    },
    moveUp: function(arr, l) {
      var index = arr.indexOf(l);
      Vue.set(arr, index, arr[index-1]);
      Vue.set(arr, index-1, l);
    },
    moveDown: function(arr, l) {
      var index = arr.indexOf(l);
      Vue.set(arr, index, arr[index+1]);
      Vue.set(arr, index+1, l);
    },
    add: function(arr, index) {
      arr.splice(index, 0, {
        name: "",
        url: ""
      });
    },
    selectSiteIcon: function() {
      var input = this.$refs.selectSiteIconInput;
      input.click();
    },
    selectSiteIconInputChange: function() {
      var input = this.$refs.selectSiteIconInput;
      var file = input.files[0];
      this.tempSiteIcon = URL.createObjectURL(file);
      this.shouldUploadSiteIcon = true;
    }
  }
});
