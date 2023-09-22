import MomentEditor from '../../lib/vue/zone/MomentEditor';
import { getState } from '../../lib/js/state';
import { visitUrl } from '../../lib/js/pageSwitch';
const { uid } = getState();
const app = new Vue({
  el: '#ZoneMomentEditor',
  data: {
    logged: !!uid,
  },
  methods: {
    published() {
      // visitUrl(`/z`);
      // 刷新
      visitUrl(`${window.location.pathname}${window.location.search}`);
    },
  },
  components: {
    'moment-editor': MomentEditor,
  },
});
