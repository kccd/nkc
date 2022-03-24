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
    // this.setData()
  },
  updated(){
    // this.setData()
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
  watch: {
    abstract: {
      immediate: true,
     handler(n){
        this.cn = n.cn || '';
      this.en = n.en || '';
     }
    }
  },
  methods: {
    // setData(){
    //   if(typeof this.abstract.cn === 'undefined'){
    //   console.warn('post.cn is not defined')
    //   this.cn = "";
    //   return;
    // };
    // if(typeof this.abstract.en === 'undefined'){
    //   console.warn('post.en is not defined')
    //   this.en = "";
    //   return;

    // };
    // this.cn = this.abstract.cn ;
    // this.en = this.abstract.en;
    // },
    getData(){
      return {
        abstractCn: this.cn,
        abstractEn: this.en
      }
    },
    // getLength(str = ''){
    //   NKC.methods.checkData.getLength(str)
    // }
  }
};
</script>

<style scoped>


.editor-abstract textarea:focus{
  outline: none;
}
.editor-abstract textarea{
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 3px;
  resize: none;
  padding: 0.5rem;
}
.editor-abstract-info{
  text-align: right;
  font-size: 1.2rem;
  color: #9baec8;
}
.editor-header{
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small{
  color: #88919d;
}
.warning {
  color: #ff6262;
}
</style>
