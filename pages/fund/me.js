function applicationMember(formId, agree) {
  return sweetQuestion(`确定要执行此操作？`)
    .then(() => {
      return nkcAPI(`/fund/a/${formId}/member`, 'PUT', {
        agree: !!agree
      });
    })
    .then(() => {
      window.location.reload();
    })
    .catch(sweetError);
}

Object.assign(window, {
  applicationMember
});