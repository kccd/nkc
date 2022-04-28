import {getDataById} from "../../../lib/js/dataConversion";
import {nkcAPI} from "../../../lib/js/netAPI";
import {sweetSuccess, sweetError} from "../../../lib/js/sweetAlert";

const data = getDataById('data');
const defaultSourceType = Object.keys(data.documentPostSettings)[0];
const app = new Vue({
  el: "#app",
  data: {
    documentPostSettings: data.documentPostSettings,
    sources: data.sources,
    selectSourceType: defaultSourceType,
    roleList: data.roleList,
    keywordsGroup: data.keywordsGroup,
    nationCodes: window.nationCodes
  },
  computed: {
    settings() {
      return this.documentPostSettings[this.selectSourceType] || null;
    }
  },
  methods: {
    selectSource(type) {
      this.selectSourceType = type;
    },
    addItem(arr) {
      arr.push({
        valueString: '',
        count: 0,
        limited: false
      });
    },
    addReviewItem() {
      this.settings.postReview.blacklist.push({
        valueString: '',
        type: 'none',
        count: 1
      });
    },
    removeItem(arr, index) {
      arr.splice(index, 1);
    },
    submit() {
      const {documentPostSettings} = this;
      nkcAPI('/e/settings/documentPost', 'PUT', {documentPostSettings})
        .then(() => {
          sweetSuccess(`保存成功`);
        })
        .catch(sweetError);
    }
  }
});