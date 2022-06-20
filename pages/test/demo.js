import Credit, {creditTypes, contentTypes} from '../lib/vue/Credit';
const app = new Vue({
  el: '#app',
  components: {
    credit: Credit
  },
  mounted() {
    // this.$refs.credit.open(creditTypes.xsf, contentTypes.post, '904546');
  }
})
