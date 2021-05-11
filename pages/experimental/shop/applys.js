/**
 * 批准开店申请
 */
function approveApply(id) {
  nkcAPI('/e/settings/shop/applys/approve', 'POST', {id:id})
  .then(function() {
    screenTopAlert('批准开店申请');
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}

/**
 * 驳回开店申请
 */
function rejectApply(id) {
  nkcAPI('/e/settings/shop/applys/reject', 'POST', {id:id})
  .then(function() {
    screenTopAlert('已驳回该申请');
  })
  .catch(function(data) {
    screenTopWarning(data.error || data);
  })
}

Object.assign(window, {
  approveApply,
  rejectApply,
});