import { getDataById } from '../../../lib/js/dataConversion';
import { nkcAPI } from '../../../lib/js/netAPI';
import { sweetSuccess, sweetError } from '../../../lib/js/sweetAlert';

const data = getDataById('data');
let hash = window.location.hash;
let defaultSourceType = 'article';
if (hash) {
  hash = hash.replace('#', '');
  if (data.publishSettings[hash]) {
    defaultSourceType = hash;
  }
}
const app = new window.Vue({
  el: '#app',
  data: {
    publishSettings: data.publishSettings,
    sources: data.sources,
    selectSourceType: defaultSourceType,
    roleList: data.roleList,
    keywordsGroup: data.keywordsGroup,
    nationCodes: window.nationCodes,
  },
  computed: {
    settings() {
      return this.publishSettings[this.selectSourceType] || null;
    },
  },
  methods: {
    selectSource(type) {
      this.selectSourceType = type;
      window.location.hash = type;
    },
    addItem(arr) {
      arr.push({
        valueString: '',
        count: 0,
        limited: false,
      });
    },
    addReviewItem() {
      this.settings.postReview.blacklist.push({
        valueString: '',
        type: 'none',
        count: 1,
      });
    },
    removeItem(arr, index) {
      arr.splice(index, 1);
    },
    submit() {
      const { publishSettings } = this;
      nkcAPI('/e/settings/publish', 'PUT', { publishSettings })
        .then(() => {
          sweetSuccess(`保存成功`);
        })
        .catch(sweetError);
    },
  },
});
