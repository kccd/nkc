import {
  SwitchArticlePanelCheckBoxDisplayStatus,
  SwitchSelectArticlePanelCheckBox,
  GetSelectedArticlesInfo,
  CancelSelectAllArticlePanelCheckBox,
} from "../lib/js/articlePanel";
import ToDraftAndDisabled from "../lib/vue/publicVue/ToDraftAndDisabled";
const elementId = 'latestManagement';
var MoveThread;
$(function() {
  window.MoveThread = new NKC.modules.MoveThread();
  MoveThread = window.MoveThread;
  const latestManagementElement = document.getElementById(elementId);
  if(latestManagementElement) {
    initVueApp();
  }
});


function initVueApp() {
  const statusList = {
    hidden: 'hidden',
    display: 'display'
  };
  const app = new Vue({
    el: `#${elementId}`,
    data: {
      statusList,
      status: statusList.hidden
    },
    components: {
      "disabled-draft": ToDraftAndDisabled
    },
    methods: {
      switchStatus() {
        if(this.status === statusList.hidden) {
          this.status = statusList.display;
        } else {
          this.status = statusList.hidden;
        }
        SwitchArticlePanelCheckBoxDisplayStatus();
      },
      selectAll() {
        SwitchSelectArticlePanelCheckBox();
      },
      getSelectedInfo() {
        return GetSelectedArticlesInfo();
      },
      // 移动文章 弹出弹窗选择专业 然后提交到服务器
      move() {
        const info = this.getSelectedInfo();
        var threadsId = info.map(t => t.tid);
        var options = {};
        if(threadsId.length === 0) return screenTopWarning("请至少勾选一篇文章");
        if(threadsId.length === 1) {
          var thread = info[0];
          options.selectedCategoriesId = thread.cids;
          options.selectedForumsId = thread.fids;
        }
        MoveThread.open(function(data) {
          var forums = data.forums;
          var moveType = data.moveType;
          var {
            violation,
            reason,
            remindUser,
            threadCategoriesId,
          } = data;
          MoveThread.lock();
          nkcAPI("/threads/move", "POST", {
            forums: forums,
            moveType: moveType,
            threadsId: threadsId,
            threadCategoriesId,
            violation,
            remindUser,
            reason
          })
            .then(function() {
              screenTopAlert("操作成功");
              MoveThread.close();
              CancelSelectAllArticlePanelCheckBox();
            })
            .catch(function(data) {
              screenTopWarning(data);
              MoveThread.unlock();
            })
        }, options);
      },
      // 退修或删除
      remove() {
        const info = this.getSelectedInfo();
        this.$refs.disabledDraft.open(info, function () {
          CancelSelectAllArticlePanelCheckBox();
        })
      }
    }
  });
  return app;
}

