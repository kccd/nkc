const data = NKC.methods.getDataById('data');

$(function() {
  const button = $('button[data-type="removeFans"]');
  button.on('click', function() {
    const jqDom = $(this);
    const uid = jqDom.attr('data-uid');
    removeFansByUid(uid);
  });
});

function removeFansByUid(uid) {
  return sweetQuestion(`确定要移除当前用户？`)
    .then(() => {
      return nkcAPI(`/m/${data.columnId}/settings/fans?uid=${uid}`, 'DELETE')
    })
   .then(function() {
     sweetSuccess('移除成功');
   })
   .catch(sweetError);
}