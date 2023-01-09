<template lang="pug">
  .modal-box
    draggable(ref="selectorRef" title="选择文章" @submit="submit")
      template(v-slot:content)
        article-selector-core(
          ref="articleSelectorCore"
          :articleSource="articleSource"
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
    callback: null,
    submitting: false,
    showDialog: false,
    articleSource: null
  }),
  methods:{
    open(callback, options={}){
      this.$refs.articleSelectorCore.init()
      this.$refs.selectorRef.open()
      this.callback = callback;
      this.articleSource = options.articleSource;

    },

    submit(){
      const articles = this.$refs.articleSelectorCore.getSelectedArticles()
      this.callback(articles);
    },
  }
}
</script>
