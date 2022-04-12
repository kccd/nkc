import {nkcAPI} from "../netAPI";
import {screenTopAlert, screenTopWarning} from "../topAlert";


//post 审核通过
export function reviewPost(pid) {
  return nkcAPI("/review", "PUT", {
    pid,
  })
    .then(function() {
      screenTopAlert("执行操作成功！");
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}
