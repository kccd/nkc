import Verifications from '../lib/vue/Verifications';
import Vue from 'vue';
import { visitUrl } from '../lib/js/pageSwitch';
import { getDataById } from '../lib/js/dataConversion';
const data = getDataById('data');
import { sweetError } from '../lib/js/sweetAlert';

new Vue({
  el: '#app',
  data: {
    cid: data.cid,
  },
  components: {
    verifications: Verifications,
  },
  methods: {
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
