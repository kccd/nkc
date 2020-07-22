
function submit(fid) {
  $("#startConcat").attr('disabled',true);
  try{
    var mergeForumId = getResultForumId();
  }catch(e) {
    return screenTopWarning(e)
  }
  var obj = {
    fid: fid,
    mergeForumId: mergeForumId
  }
	nkcAPI('/f/'+fid+'/settings/merge', 'PUT', obj)
		.then(function() {
      screenTopAlert('保存成功');
      $("#startConcat").attr('disabled',false);
		})
		.catch(function(data) {
      screenTopWarning(data.error || data);
      $("#startConcat").attr('disabled',false);
		})

}
