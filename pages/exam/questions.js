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
function auth(qid, type) {
  var reason = '';
  if(!!!type) {
    reason = prompt('请输入原因：', '');
    if(reason === null) return;
    if(reason === '') return screenTopWarning('原因不能为空');
  }
  nkcAPI('/exam/auth', 'POST', {
    status: !!type,
    qid: qid,
    reason: reason
  })
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
function deleteQuestion(qid) {
  if(confirm('确定要删除试题？') === false) return;
  nkcAPI('/exam/question/' + qid, 'DELETE', {})
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data);
    });
}   
/*
* 修改题库试题的状态
* @param {String} qid 试题 ID
* @param {String} status 状态类型
* */
function modifyQuestionStatus(qid, auth) {
  return sweetQuestion('确定要执行当前操作？')
    .then(() => {
      return nkcAPI(`/exam/question/${qid}/auth`, 'PUT', {
        auth
      });
    })
    .then(() => {
      sweetSuccess('执行成功');
    })
    .catch(sweetError);
}

Object.assign(window, {
  disabledQuestion,
  enabledQuestion,
  auth,
  deleteQuestion,
  modifyQuestionStatus,
});
