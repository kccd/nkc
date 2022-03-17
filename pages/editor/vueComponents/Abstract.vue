<template lang="pug">
  .abstract
    .editor-header 摘要
      small （选填）
    .row.editor-abstract
      .col-xs-12.col-md-6
        textarea(placeholder="中文摘要，最多可输入1000字符" rows=7 v-model.trim="cn")
        .editor-abstract-info(:class="{'warning': abstractCnLength > 1000}") {{abstractCnLength}} / 1000
      .col-xs-12.col-md-6
        textarea(placeholder="英文摘要，最多可输入1000字符" rows=7 v-model.trim="en")
        .editor-abstract-info(:class="{'warning': abstractEnLength > 1000}") {{abstractEnLength}} / 1000
</template>

<script>
export default {

  data: () => ({
    cn: "", // 中文摘要
    en: "" // 英文摘要
  }),
  props: {
    abstract: {
      require: true,
      type : Object,
      default: ()=>({})
    }
  },
  created() {
    if(typeof this.abstract.cn === 'undefined'){
      console.warn('post.cn is not defined')
      this.cn = "";
      return;
    };
    if(typeof this.abstract.en === 'undefined'){
      console.warn('post.en is not defined')
      this.en = "";
      return;

    };
    this.cn = this.abstract.cn ;
    this.en = this.abstract.en;
  },
  computed: {
    abstractCnLength() {
      // return this.getLength(this.cn);
      return NKC.methods.checkData.getLength(this.cn)
    },
    abstractEnLength() {
      return NKC.methods.checkData.getLength(this.en)

    }
  },
  methods: {
    getData(){
      return {
        cn: this.cn,
        en: this.en
      }
    },
    // getLength(str = ''){
    //   NKC.methods.checkData.getLength(str)
    // }
  }
};
</script>

<style>
.warning {
  color: #ff6262;
}
</style>
