
var CommonModal = new NKC.modules.CommonModal();
var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: '#app',
  data: {
    progress: 0,
    data
  },
  mounted: function () {
  },
  methods: {
    changeDownLoadState: function (item) {
      var newVersion = JSON.parse(JSON.stringify(item));
      newVersion.canDown = !newVersion.canDown;
      nkcAPI('/e/settings/app/histories', 'PATCH', { newVersion: newVersion, operating: 'changeState' })
        .then(function (res) {
          console.log(res);
          item.canDown = !item.canDown;
          return sweetSuccess('修改成功！');
          // location.reload();
        }).catch(function (err) {
          return sweetError(err);
        })
    },
    setStable: function (item) {
      var that = this;
      var newVersion = JSON.parse(JSON.stringify(item));
      newVersion.stable = true;
      nkcAPI('/e/settings/app/histories', 'PATCH', { newVersion: newVersion, operating: 'setStable' })
        .then(function (res) {
          console.log(res);
          that.data.histories.forEach(function (ele) {
            ele.stable = false;
          });
          item.stable = true;
          return sweetSuccess('修改成功！');
          // location.reload();
        }).catch(function (err) {
          return sweetError(err);
        })
    },
    updateVersion: function (item) {
      CommonModal.open(function (data) {
        if (!data[0].value) return screenTopAlert("请输入版本号！");
        if (!data[1].value) return screenTopAlert("请输入更新内容！");
        var newVersion = JSON.parse(JSON.stringify(item));
        newVersion.appVersion = data[0].value
        newVersion.appDescription = data[1].value
        nkcAPI('/e/settings/app/histories', 'PATCH', { newVersion: newVersion, operating: 'updateVersion' })
          .then(function (res) {
            return sweetSuccess('修改成功！');
            // location.reload();
          }).catch(function (err) {
            return sweetError(err);
          })
      }, {
          title: "修改版本信息",
          data: [
            {
              dom: "input",
              label: "版本号",
              value: item.appVersion
            },
            {
              dom: "textarea",
              label: "更新内容",
              value: item.appDescription
            }
          ]
        })
    },
    submitApp: function () {
      var that = this;
      
      geid('submitApp').disabled = true;
      var platform = $('#platform').val();
      var version = $('#version').val();
      var description = $('#description').val();
      var toc = new Date().getDate();
      if (!version) {
        geid('submitApp').disabled = false;
        return sweetError("请输入版本号！");
      }
      if (!description) {
        geid('submitApp').disabled = false;
        return sweetError("请输入更新内容！");
      }
      var file = geid('appfile').files;
      if (file.length == 0) {
        geid("submitApp").disabled = false;
        return sweetError("请选择一个安装包！");
      } else if (file[0].type !== 'application/vnd.android.package-archive') {
        geid("submitApp").disabled = false;
        return sweetError("文件格式必须为apk ！");
      }
      var formData = new FormData();
      formData.append("file", file[0])
      formData.append("appPlatform", platform);
      formData.append("appVersion", version);
      formData.append("appDescription", description);
      formData.append("appToc", toc);
      uploadFilePromise("/e/settings/app/upload", formData, function (e, p) {
        that.progress = p;
      })
        .then(function (data) {
          geid('submitApp').disabled = false;
          return sweetSuccess('上传成功！');
        })
        .catch(function (data) {
          that.progress = 0;
          sweetError(data.error || data);
          geid('submitApp').disabled = false;
        })
    }
  }
});
