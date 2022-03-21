import UserPanel from "../lib/vue/publicVue/userPanel/UserPanel";
//创建用户导航栏vue实例
const panel = new Vue({
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
      this.$refs.userPanel.showDraw();
    }
  }
})
export default panel
