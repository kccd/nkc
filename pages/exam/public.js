// import Verifications from '../lib/vue/Verifications';
import Verifications from '../lib/vue/VerificationCode.vue';
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
  components: {
    verifications: Verifications,
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
    getSecret() {
      return this.$refs.verifications.open().then((res) => res.secret);
    },
    visitPublicExam() {
      this.getSecret()
        .then((secret) => {
          visitUrl(
            `/exam/paper?cid=${this.cid}&from=register&secret=${secret}`,
          );
        })
        .catch(sweetError);
    },
  },
});
