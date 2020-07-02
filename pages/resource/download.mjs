window.payForDownloadResource = function(rid) {
  let a = document.createElement("a");
  a.href = `/r/${rid}?t=download`;
  let downloadAttr = document.createAttribute("download");
  a.setAttributeNode(downloadAttr);
  a.click();
  window.close();
}