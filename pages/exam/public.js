// import Verifications from '../lib/vue/Verifications';
import Vue from 'vue';
import { visitUrl } from '../lib/js/pageSwitch';
import { getDataById } from '../lib/js/dataConversion';
const data = getDataById('data');
import { sweetError } from '../lib/js/sweetAlert';
import { nkcAPI, HttpMethods } from '../lib/js/netAPI';

new Vue({
  el: '#app',
  data: {
    cid: data.cid,
    codeId: '',
    codeValue: [],
    codeResult: '',
  },
  mounted() {
    this.getCode();
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
  },
});
