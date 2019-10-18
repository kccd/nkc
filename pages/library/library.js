var ResourceInfo;
$(function() {
  ResourceInfo = new NKC.modules.ResourceInfo();
});

function showResource(rid) {
  ResourceInfo.open({
    rid: rid
  });
}