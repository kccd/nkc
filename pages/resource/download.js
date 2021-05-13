let opened = false;
// 支付积分并下载
window.payForDownloadResource = function(rid) {
  let a = document.createElement("a");
  if(opened) {
    a.href = `/r/${rid}?d=attachment&random=${Math.random()}`;
  }else {
    a.href = `/r/${rid}?c=download&random=${Math.random()}`;
    a.setAttributeNode(document.createAttribute("download"));
    opened = true;
  }
  // console.log(`访问: ${a.href}`);
  a.click();
  $(".resource-scores").remove();
  $(".error-code").remove();
  $(".resource-downloaded-tip").show();
  $(".download-button").text("重新下载");
}

// 预览PDF
window.previewPDFResource = function(rid) {
  let a = document.createElement("a");
  if(!opened) {
    a.href = `/r/${rid}?c=preview_pdf&random=${Math.random()}`;
    a.setAttribute("target", "_blank");
    a.click();
    opened = true;
  } else {
    a.href = NKC.methods.tools.getUrl('pdf', rid);
    a.setAttribute("target", "_blank");
    a.click();
  }
  // console.log(`访问: ${a.href}`);
}
window.closePage = function() {
  if(NKC.configs.platform === 'reactNative') {
    NKC.methods.appClosePage();
  } else {
    window.close();
  }
}
