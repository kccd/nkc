import { nkcAPI } from '../lib/js/netAPI';
import Vue from 'vue';
import { sweetError } from '../lib/js/sweetAlert';
new Vue({
  el: '#take-exam',
  data() {
    return {
      msg: [
        { name: '测试1', id: 1 },
        { name: '测试2', id: 2 },
        { name: '测试3', id: 3 },
        { name: '测试4', id: 4 },
        { name: '测试5', id: 5 },
        { name: '测试6', id: 6 },
      ],
      currentQuestion: 0,
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
    pre() {
      if (this.currentQuestion === 0) {
        sweetError('没有上一题了');
      } else {
        this.currentQuestion -= 1;
      }
    },
    prv() {
      if (this.currentQuestion === this.msg.length-1) {
        sweetError('没有下一题了');
      } else {
        this.currentQuestion += 1;
      }
    },
  },
});
