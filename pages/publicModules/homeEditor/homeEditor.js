console.log($('#homeEditor'))
NKC.modules.homeEditor = new Vue({
  el: "#homeEditor",
  data: {
  },
  mounted() {
    console.log('进入编辑页面')
  },
  methods: {
    save(){
      NKC.modules.homeAll.domHidden = '';
    },
  }
})