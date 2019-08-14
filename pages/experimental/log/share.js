function searchCode() {
  var code = $("#codeInp").val();
  if(!code) return sweetWarning("分享码不能为空");
  openToNewLocation('/e/log/share?&content=' + code);
}