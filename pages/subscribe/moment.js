import MomentEditor from '../lib/vue/MomentEditor';
const momentForm = new Vue({
  el: '#momentForm',
  components: {
    'moment-editor': MomentEditor
  },
  methods: {
    onPublished() {
      window.location.href = location.pathname;
    }
  }
})