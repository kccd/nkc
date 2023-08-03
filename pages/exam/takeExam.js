import { nkcAPI } from '../lib/js/netAPI';
import Vue from 'vue';
import { sweetError, sweetSuccess } from '../lib/js/sweetAlert';
new Vue({
  el: '#take-exam',
  data() {
    return {
      msg: [{ name: '测试1', id: 1 }],
      currentQuestion: 0,
      answer: 1,
    };
  },
  mounted() {
    this.getTakeExam();
  },
  methods: {
    getTakeExam() {
      nkcAPI('/api/v1/exam/public/paper', 'GET')
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
      if (Number(this.answer) !== this.msg[this.currentQuestion].id) {
        sweetError('答案选错了请重新勾选');
      } else if (this.currentQuestion === this.msg.length - 1) {
        nkcAPI('/api/v1/exam/public/result', 'POST').then((res) => {
          console.log(res, 'res');
        });
        sweetSuccess('通过了');
      } else {
        this.currentQuestion += 1;
      }
    },
  },
});
