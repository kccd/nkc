// import FloatUserPanel from '../../lib/vue/FloatUserPanel.vue'
// 移动到作者名称上显示的hover效果
// $(document).ready(()=>{
  // new Vue({
  //   el: "#vue-author-hover",
  //   components:{
  //     'float-user-panel': FloatUserPanel,
  //   },
  //   mounted(){
  //     this.$nextTick(()=>{
  //       this.$refs.floatUserPane.initPanel()
  //     })
  //   },
  // });
// })
Object.assign(window, {originTitle})
function originTitle(){
  if($('#dropdown').hasClass('open')){
    $('#dropdown').removeClass('open');
  }else{
    $('#dropdown').addClass('open');
  }
}