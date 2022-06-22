import MomentEditor from '../../lib/vue/zone/MomentEditor';
import {getState} from "../../lib/js/state";
import {visitUrl} from "../../lib/js/pageSwitch";
const {uid} = getState();
const app = new Vue({
  el: '#latestZoneMomentEditor',
  data: {
    logged: !!uid,
  },
  methods: {
    published() {
      visitUrl(`/n/zone`);
    }
  },
  components: {
    'moment-editor': MomentEditor
  }
});
