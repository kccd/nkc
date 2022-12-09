import CommentHit from "../lib/vue/comment/CommentHit";
import {screenTopAlert, screenTopWarning} from "../lib/js/topAlert";
import {nkcAPI} from "../lib/js/netAPI";

if($('#CommentHitBox').length > 0) {
  new Vue({
    el: "#CommentHitBox",
    components: {
      "comment-hit": CommentHit
    },
  })
}



//撤销学术分
function cancelArticleXsf(aid, id) {
  var reason = prompt('请输入撤销原因：');
  if(reason === null) return;
  if(reason === '') return screenTopWarning('撤销原因不能为空！');
  nkcAPI('/article/' + aid + '/credit/xsf/' + id + '?reason=' + reason, 'DELETE', {})
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}

//隐藏鼓励信息
function hideArticleKcbRecordReason(aid, recordId, hide) {
  nkcAPI("/article/" + aid + "/credit/kcb/" + recordId, "PUT", {
    hide: !!hide
  })
    .then(function() {
      if(hide) {
        screenTopAlert("屏蔽成功");
      } else {
        screenTopAlert("已取消屏蔽");
      }
    })
    .catch(function(data) {
      screenTopWarning(data);
    })
}

Object.assign(window, {
  cancelArticleXsf,
  hideArticleKcbRecordReason,
})


