function ensureRemittance(id, number) {
  return sweetQuestion(`确定要执行此操作？`)
    .then(() => {
      $('#remittance').attr('disabled', true);
      return nkcAPI('/fund/a/'+id+'/remittance', 'POST', {number: number});
    })
    .then(function (data) {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
      $('#remittance').removeAttr('disabled');
    })
}

function withdrawApplicationForm(id) {
  return sweetPrompt(`请输入撤回原因`, '')
    .then((reason) => {
      return nkcAPI(`/fund/a/${id}/manage/withdraw`, 'POST', {
        reason
      })
    })
    .then(function(data) {
      sweetSuccess(`执行成功`);
    })
    .catch(function(data) {
      sweetError(data);
    })
}

function refuseApplicationForm(id) {
  return sweetQuestion(`确定要执行此操作？`)
    .then(() => {
      return nkcAPI('/fund/a/'+id+'?type=refuse', 'DELETE', {});
    })
    .then(function(data) {
      // window.location.href = '/fund/a/'+data.applicationForm._id;
      openToNewLocation('/fund/a/'+data.applicationForm._id);
    })
    .catch(function(data) {
      sweetError(data);
    })
}

Object.assign(window, {
  ensureRemittance,
  withdrawApplicationForm,
  refuseApplicationForm,
});