import {sweetWarning} from "./sweetAlert";

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
      if(code && code.length > 0){
        return nkcAPI(`/u/${uid}/code`, 'POST', {code})
      }else {
        return new Promise((resolve,reject)=>{
          reject('动态码不能为空')
        })
      }
    })
    .then(() => {
      sweetSuccess('验证通过');
    })
    .catch(err => {
      sweetError(err);
    });
}
