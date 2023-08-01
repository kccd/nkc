import { nkcAPI } from '../lib/js/netAPI';
import Vue from 'vue';
new Vue({
  el: '#exam-public',
  data() {
    return {
      publicExamNotes: '',
    };
  },
  mounted() {
    this.getExamNotes();
  },
  methods: {
    getExamNotes() {
      nkcAPI('/api/v1/exam/public', 'GET')
        .then((res) => {
          if (res.data.publicExamNotes) {
            this.publicExamNotes = res.data.publicExamNotes;
          }
        })
        .catch((err) => {
          console.log(err, '失败');
        });
    },
    takeExam(event) {
      event.preventDefault(); // 阻止默认行为（页面跳转）
      window.location.href = '/exam/public/takeExam';
    },
  },
});
