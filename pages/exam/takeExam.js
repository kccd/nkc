import { nkcAPI } from '../lib/js/netAPI';
import Vue from 'vue';
import { sweetError, sweetSuccess } from '../lib/js/sweetAlert';
import { getDataById } from '../lib/js/dataConversion';
import { setRegisterActivationCodeToLocalstorage } from '../lib/js/activationCode';
import { visitUrl } from '../lib/js/pageSwitch';

new Vue({
  el: '#take-exam',
  data() {
    return {
      answer: 1,
      paper: {},
      question: {},
      questionTotal: 0,
      isMultiple: false,
      index: 0,
      selected: [],
      fill: '',
      pid: '',
    };
  },
  mounted() {
    this.getInit();
  },
  methods: {
    //获取考题
    getInit() {
      const data = getDataById('data');
      this.pid = data.pid;
      nkcAPI(`/api/v1/exam/public/paper/${this.pid}?index=${this.index}`, 'GET')
        .then((res) => {
          if (res) {
            const { paper, question, questionTotal, isMultiple, index } =
              res.data;
            const { answer, type, ...params } = question;
            //选择题
            if (type === 'ch4') {
              const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 一个包含所有字母的字符串
              const alphabetArray = str.split(''); // 将字符串拆分为单个字母字符的数组
              const newAnswer = answer.map((a, index) => {
                const { ...resParams } = a;
                const serialIndex = alphabetArray[index];
                return { ...resParams, serialIndex };
              });
              this.question = { ...params, answer: newAnswer, type };
            } else {
              this.question = question;
            }
            this.questionTotal = questionTotal;
            this.isMultiple = isMultiple;
            this.paper = paper;
            this.index = index;
          }
        })
        .catch((error) => {
          sweetError(error);
        });
    },
    submit() {
      let selected = [];
      if (!Array.isArray(this.selected)) {
        selected.push(this.selected);
      } else {
        selected = this.selected;
      }
      const { qid } = this.question;
      nkcAPI(`/api/v1/exam/public/result/${this.pid}`, 'POST', {
        index: this.index,
        qid,
        selected,
        fill: this.fill,
      })
        .then((res) => {
          if (res.data) {
            const { message, status, newQuestion } = res.data;
            if (status === 403) {
              sweetError(message);
            } else if (status === 200) {
              const { index } = res.data;
              if (index <= this.questionTotal - 1) {
                this.index = index;
                this.getInit();
              } else {
                nkcAPI(
                  `/api/v1/exam/public/final-result/${this.pid}`,
                  'POST',
                ).then((res) => {
                  if (res) {
                    sweetSuccess('顺利完成');
                    const { activationCode, redirectUrl } = res.data;
                    setRegisterActivationCodeToLocalstorage(activationCode);
                    visitUrl(redirectUrl);
                  }
                });
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
          sweetError(error);
        });
    },
  },
});
