/*
* 添加用户到基金黑名单
* @param {String} uid 用户 ID
* @param {Number} applicationFormId 基金申请表 ID 非必须
* */
export function addUserToFundBlacklist(uid, applicationFormId) {
  return sweetPrompt(`加黑原因`)
    .then(reason => {
      return nkcAPI(`/fund/blacklist`, 'POST', {
        uid,
        reason,
        applicationFormId
      })
    })
    .then(() => {
      sweetSuccess(`执行成功`);
    })
    .catch(sweetError);
}

/*
* 将用户从基金黑名单中移除
* @param {String} uid 用户 ID
* */
export function removeUserFromFundBlacklist(uid) {
  nkcAPI(`/fund/blacklist?uid=${uid}`, 'DELETE')
    .then(() => {
      sweetSuccess('执行完成');
    })
    .catch(sweetError);
}