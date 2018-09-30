function submitApp() {
  var platform = $('#platform').val();
  var version = $('#version').val();
  var description = $('#description').val();
  var toc = new Date().getDate();
  if(!version) return screenTopAlert("请输入版本号！");
  if(!description) return screenTopAlert("请输入更新内容！");
  var file = geid('appfile').files;
  if(file.length == 0) return screenTopAlert("请选择一个安装包！")
  var formData = new FormData();
  formData.append("file", file[0])
  formData.append("appPlatform",platform);
  formData.append("appVersion", version);
  formData.append("appDescription", description);
  formData.append("appToc", toc);
  uploadFilePromise("/e/settings/app/upload", formData)
  .then(function(data) {
    screenTopAlert("上传成功")
  })
  .catch(function(data) {
    screenTopAlert(data.error || data)
  })
}