import { nkcAPI } from '../netAPI';
import { screenTopAlert, screenTopWarning } from '../topAlert';
import { reviewActions } from '../review';
//post 审核通过
export function reviewPost(pid) {
  return reviewActions
    .approvePostReview({
      postsId: [pid],
    })
    .then(function () {
      screenTopAlert('执行操作成功！');
    })
    .catch(function (data) {
      screenTopWarning(data);
    });
}
