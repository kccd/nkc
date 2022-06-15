import {
  SwitchArticlePanelCheckBoxDisplayStatus,
  SwitchSelectArticlePanelCheckBox,
  GetSelectedArticlesInfo,
} from "../lib/js/articlePanel";

const elementId = 'latestManagement';

$(function() {
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
      move() {
        const info = this.getSelectedInfo();
        // 移动
      },
      remove() {
        const info = this.getSelectedInfo();
        // 退修或删除
      }
    }
  });
  return app;
}

