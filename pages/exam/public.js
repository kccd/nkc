// import Verifications from '../lib/vue/Verifications';
import Vue from 'vue';
import { visitUrl } from '../lib/js/pageSwitch';
import { getDataById } from '../lib/js/dataConversion';
const data = getDataById('data');
import { sweetError } from '../lib/js/sweetAlert';
import { nkcAPI, HttpMethods } from '../lib/js/netAPI';

Vue.directive('translate', {
  update(el, binding, vnode) {
    const { value } = binding;

    if (value && typeof value === 'object') {
      const language = vnode.context.$data.currentLanguage;
      const translation = value[language];

      if (translation) {
        el.textContent = translation;
      }
    }
  },
});
new Vue({
  el: '#app',
  data: {
    cid: data.cid,
    codeId: '',
    codeValue: [],
    codeResult: '',
    examSource: data.examSource,
    currentLanguage: 'zh',
  },
  mounted() {
    this.getCode();
    setTimeout(() => {
      this.handleSelection();
    }, 150);
  },
  methods: {
    changeCode() {
      this.getCode();
    },
    getCode() {
      nkcAPI('/register/exam/code', HttpMethods.GET)
        .then((data) => {
          const { codeId, codeValue } = data;
          this.codeId = codeId;
          this.codeValue = codeValue;
        })
        .catch(sweetError);
    },
    visitPublicExam() {
      nkcAPI(
        `/exam/paper?cid=${this.cid}&from=register&codeId=${this.codeId}&codeResult=${this.codeResult}`,
        HttpMethods.GET,
      )
        .then((data) => {
          visitUrl(data.redirectUrl);
        })
        .catch((err) => {
          this.changeCode();
          sweetError(err);
        });
    },
    handleSelection() {
      const examSource = this.examSource;
      this.$nextTick(() => {
        const isChinese = /^[\u4e00-\u9fff]+$/.test(
          [...examSource].find((item) => item._id === this.cid).name,
        );
        if (!isChinese) {
          this.$data.currentLanguage = 'en';
        } else {
          this.$data.currentLanguage = 'zh';
        }
      });
    },
  },
});
