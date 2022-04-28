import UserPanel from "../lib/vue/publicVue/userPanel/UserPanel";
//创建用户导航栏vue实例
export const initUserPanel = function () {
  if($('#userNav').length === 0) return;
  return new Vue({
    el: '#userNav',
    data: {
    },
    mounted(){
    },
    components: {
      "user-panel": UserPanel
    },
    methods: {
      updateNewMessageCount(count) {
        this.$refs.userPanel.updateNewMessageCount(count);
      },
      showDraw() {
        //获取用户面板信息并展示
        this.$refs.userPanel.showDraw();
      }
    }
  })
}
