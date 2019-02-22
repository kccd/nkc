function disabledQuestion(qid) {
  var reason = prompt('请输入原因(500字以内)：', '');
  if(reason === null) return;
  if(reason === '') return screenTopWarning('原因不能为空');
  nkcAPI('/exam/question/' + qid + '/disabled', 'POST', {reason: reason})
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
function enabledQuestion(qid) {
  nkcAPI('/exam/question/' + qid + '/disabled', 'DELETE', {})
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}