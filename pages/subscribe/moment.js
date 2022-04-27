import MomentEditor from '../lib/vue/zone/MomentEditor';
import Moments from '../lib/vue/zone/Moments';
import Paging from '../lib/vue/Paging';
import {getDataById} from "../lib/js/dataConversion";
import {visitUrl} from "../lib/js/pageSwitch";
const data = getDataById('data');
const moment = new Vue({
  el: '#moment',
  components: {
    'moment-editor': MomentEditor,
    'moments': Moments,
    'paging': Paging
  },
  data: {
    momentsData: data.momentsData,
    pages: data.paging.buttonValue,
    permissions: data.permissions,
  },
  methods: {
    selectPage(num) {
      visitUrl(`/g/moment?page=${num}`);
    },
    onPublished() {
      window.location.href = location.pathname;
    }
  }
})
