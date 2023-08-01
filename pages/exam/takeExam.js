import { nkcAPI } from '../lib/js/netAPI';
import Vue from 'vue';
import { sweetError } from '../lib/js/sweetAlert';
new Vue({
  el: '#take-exam',
  data() {
    return {
      msg: '测试',
    };
  },
  mounted() {
    this.getTakeExam();
  },
  methods: {
    getTakeExam() {
      nkcAPI('/api/v1/exam/public/takeExam', 'GET')
        .then((res) => {
          console.log(res, 'res');
        })
        .catch((err) => {
          sweetError(err);
        });
    },
  },
});
