<template lang="pug">
  .modal-box
    draggable(ref="selectorRef" title="选择文章" @submit="submit")
      template(v-slot:content)
        article-selector-core(
          ref="articleSelectorCore"
        )

</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.selector-box {
  padding: 0.5rem;
  background-color: #eee;
}
</style>
<script>
import ArticleSelectorCore from "./ArticleSelectorCore";
import draggable from "../draggable";
export default {
  components: {
    ArticleSelectorCore,
    draggable
  },
  data: ()=>({
    submitting: false,
    showDialog: false,
  }),
  mounted() {
    // this.dom = $("#moduleArticleSelector");
    // this.dom.modal({
    //   show: false
    // });
  },
  methods:{
    open(callback, options={}){
      this.$refs.selectorRef.open()
      // this.dom.modal("show");
      // this.$refs.articleSelectorCore.open((data)=>{
      //   this.selectedCategories = data;
      // },{source:'article'})
    },
    // getSelectedArticles(){
    //   return this.$refs.articleSelectorCore.getSelectedArticles()
    // },
    submit(){
      console.log('执行getSelectedArticles');
    },
  }
}
</script>
