import Vue from 'vue';
new Vue({
  el: '#exam-public',
  data() {
    return {
      publicExamNotes: '',
      cid: '',
    };
  },
  mounted() {
    this.getInit();
  },
  methods: {
    //初始化
    getInit() {
      const data = NKC.methods.getDataById('data');
      this.publicExamNotes = data.publicExamNotes;
      this.cid = data.examSource[0]._id;
    },
  },
});
