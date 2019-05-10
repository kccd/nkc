moduleCrop.init(function(data) {
  var user = getDataById("data").user;
  var formData = new FormData();
  formData.append("file", data);
  uploadFilePromise('/avatar/' + user.uid, formData, function(e, percentage) {
    $(".upload-info").text('上传中...' + percentage);
    if(e.total === e.loaded) {
      $(".upload-info").text('上传完成！');
      setTimeout(function() {
        $(".upload-info").text('');
      }, 2000);
    }
  }, "POST")
    .then(function() {
      $("#img_l").attr("src", "/avatar/" + user.uid + '?t=lg' + "&time=" + Date.now());
      $("#img_s").attr("src", "/avatar/" + user.uid + '?t=sm' + "&time=" + Date.now());
      $("#img_m").attr("src", "/avatar/" + user.uid + '?time=' + Date.now());
    })
    .catch(function(data) {
      screenTopWarning(data);
    });
}, {
  aspectRatio: 1
});
function selectAvatar() {

  moduleCrop.show();
}
