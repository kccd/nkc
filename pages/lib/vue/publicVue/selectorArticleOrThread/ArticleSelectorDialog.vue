<template lang="pug">
  .modal-box
    draggable(ref="selectorRef" title="选择文章")
      template(v-slot:content)
        article-selector-core(
          ref="articleSelectorCore"
          :articleSource="articleSource"
        )
        .box-footer
          .display-i-b(v-if="submitting") 处理中，请稍候...
          button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
          button(v-if="submitting" type="button" class="btn btn-primary btn-sm" disabled) 确定
          button(v-else type="button" class="btn btn-primary btn-sm" @click="submit") 确定

</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.selector-box {
  padding: 0.5rem;
  background-color: #eee;
}
.box-footer{
  padding: 0.8rem 1.4rem;
  button{
    margin-left: 0.5rem;
  }
  text-align: right;
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
    callback: null,
    submitting: false,
    articleSource: null
  }),
  methods:{
    open(callback, options={}){
      this.$refs.articleSelectorCore.init()
      this.$refs.selectorRef.open()
      this.callback = callback;
      this.submitting = false;
      this.articleSource = options.articleSource;
    },
    close() {
      this.$refs.selectorRef.close();
    },
    submit(){
      this.submitting = true;
      const articles = this.$refs.articleSelectorCore.getSelectedArticles;
      this.callback(articles);
      this.close()
    },
  }
}
</script>
