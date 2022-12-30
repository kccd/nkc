<template lang="pug">
  .modal.fade#moduleArticleSelector(tabindex="-1" role="dialog" aria-labelledby="myModalLabel")
    .modal-dialog(role="document")
      .selector-box
        .selector-header
          button.close(data-dismiss="modal" aria-label="Close")
            span(aria-hidden="true") &times;
          h4.selector-title 选择文章
        .selector-body
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
import SinglePost from "../postModel/SinglePost";
export default {
  components: {
    'article-selector-core': ArticleSelectorCore,
    SinglePost
  },
  data: ()=>({
    showDialog: false,
  }),
  mounted() {
    this.dom = $("#moduleArticleSelector");
    this.dom.modal({
      show: false
    });
  },
  methods:{
    open(callback, options={}){
      this.dom.modal("show");
      // this.$refs.articleSelectorCore.open((data)=>{
      //   this.selectedCategories = data;
      // },{source:'article'})
    },
    getSelectedArticles(){
      return this.$refs.articleSelectorCore.getSelectedArticles()
    }
  }
}
</script>
