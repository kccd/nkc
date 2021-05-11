var ResourceInfo;
$(function() {
  window.ResourceInfo = new NKC.modules.ResourceInfo();
});

function showResource(rid) {
  ResourceInfo.open({
    rid: rid
  });
}

window.showResource = showResource;