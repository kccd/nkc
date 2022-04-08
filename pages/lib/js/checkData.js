export const checkString = NKC.methods.checkData.checkString;
export const checkNumber = NKC.methods.checkData.checkNumber;
export const getLength = NKC.methods.checkData.getLength;
/*
  * 验证动态码
  * @param {string} 需要验证的用户uid
  * */
export const checkUserCode = function (uid) {
  return sweetPrompt('请输入动态码')
    .then(code => {
      return nkcAPI(`/u/${data.uid}/code`, 'POST', {code})
    })
    .then(() => {
      sweetSuccess('验证通过');
    })
    .catch(err => {
      sweetError(err);
    });
}
