import { HttpMethods, nkcAPI } from './netAPI';
import { sweetQuestion, sweetError } from './sweetAlert';

export function deleteQuestion(qid) {
  sweetQuestion('当前操作无法撤销，确定要删除试题吗？')
    .then(() => {
      return nkcAPI('/exam/question/' + qid, HttpMethods.DELETE, {});
    })
    .then(function () {
      window.location.reload();
    })
    .catch(sweetError);
}
