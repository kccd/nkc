// 支付积分并下载
window.payForDownloadResource = function(rid) {
  let a = document.createElement("a");
  a.href = `/r/${rid}?c=download`;
  let downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
}

// 预览PDF
window.previewPDFResource = function(rid) {
  let a = document.createElement("a");
  a.href = `/r/${rid}?c=preview_pdf`;
  a.setAttribute("target", "_blank");
  a.click();
  window.close();
}
