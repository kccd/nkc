<template lang="pug">
  .orginal
    .editor-header 原创
      small （字数小于{{original.wordLimit}}的文章无法声明原创）
    .editor-origin-state.form-inline
      select.form-control(v-model="originState" :disabled="!allowedOriginal" :title="!allowedOriginal?'字数小于'+original.wordLimit+'的文章不可申明原创': ''")
        option(:value="index" v-for="(val, key ,index) in getOriginLevel" :key="key") {{val}}
</template>

<script>


export default {
  data: () => ({
    originState: 0,
    contentLength: 0
  }),
  props: {
    original: {
      type: Object,
      required: true
    },
  },
  created() {
    if(typeof this.original.state === "undefined"){
      console.error('original.state is not defined');
      return
    }
    this.originState = this.original.state
  },
  computed: {
    allowedOriginal() {
      return this.contentLength >= this.original?.wordLimit;
      // if(!allowed) this.originState = 0;

    },
    getOriginLevel() {
      return {
        "0": "不声明",
        "1": "普通转载",
        "2": "获授权转载",
        "3": "受权发表(包括投稿)",
        "4": "发表人参与原创(翻译)",
        "5": "发表人是合作者之一",
        "6": "发表人本人原创"
      };
    },
  },
  methods: {
    contentChange(length){
      this.contentLength = length
    },
    getData(){
      return {
        originState : this.originState
      }
    }
  }
};
</script>

<style scoped>

.editor-header{
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small{
  color: #88919d;
}
</style>
