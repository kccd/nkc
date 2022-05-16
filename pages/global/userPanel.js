import UserPanel from "../lib/vue/publicVue/userPanel/UserPanel";
//创建用户导航栏vue实例
export const initUserPanel = function () {
  if($('#userNav').length === 0) return;
  return new Vue({
    el: '#userNav',
    data: {
    },
    mounted(){
      this.initUserNavAvatar();
      this.initCloseEvent();
    },
    components: {
      "user-panel": UserPanel
    },
    methods: {
      initUserNavAvatar() {
        const avatar = document.getElementById('userNavAvatar');
        const self = this;
        avatar.addEventListener('click', (e) => {
          self.switchDraw();
          e.stopPropagation();
        });
      },
      initCloseEvent() {
        const self = this;
        document.addEventListener('click', (e) => {
          self.hideDraw();
        });
      },
      updateNewMessageCount(count) {
        this.$refs.userPanel.updateNewMessageCount(count);
      },
      hideDraw() {
        this.$refs.userPanel.hideDraw();
      },
      showDraw() {
        //获取用户面板信息并展示
        this.$refs.userPanel.showDraw();
      },
      switchDraw() {
        this.$refs.userPanel.switchDraw();
      }
    }
  })
}
