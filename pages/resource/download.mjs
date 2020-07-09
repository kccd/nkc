let opened = false;
// 支付积分并下载
window.payForDownloadResource = function(rid) {
  let a = document.createElement("a");
  a.href = `/r/${rid}?c=download`;
  let downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
  $(".resource-scores").remove();
  $(".error-code").remove();
  $(".resource-downloaded-tip").show();
  $(".download-button").text("重新下载");
}

// 预览PDF
window.previewPDFResource = function(rid) {
  if(!opened) {
    let a = document.createElement("a");
    a.href = `/r/${rid}?c=preview_pdf`;
    a.setAttribute("target", "_blank");
    a.click();
    opened = true;
  } else {
    let a = document.createElement("a");
    a.href = NKC.methods.tools.getUrl('pdf', rid);
    a.setAttribute("target", "_blank");
    a.click();
  }
}
window.closePage = function() {
  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.appClosePage();
  } else {
    window.close();
  }
}
