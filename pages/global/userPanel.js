import UserPanel from "../lib/vue/publicVue/userPanel/UserPanel";
//创建用户导航栏vue实例
function initUserNav(){
  const draw = new Vue({
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
        this.$refs.userPanel.updateNewMessageCount()
      },
      showDraw() {
        this.$refs.userPanel.showDraw()
      }
    }
  })
  return draw;
}
export default initUserNav
