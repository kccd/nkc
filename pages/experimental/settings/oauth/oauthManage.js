import {objToStr} from "../../../lib/js/tools";
const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    searchType: data.searchType || 'username',
    searchContent: data.searchContent || '',
    oauthList: data.oauthList,
    selectedOauthId: [],
    oauthStatus: data.oauthStatus,
    oauthOperations: data.oauthOperations,
  },
  computed: {
    iconUrl() {
      return this.iconFile? window.URL.createObjectURL(this.iconFile): ''
    },
  },
  methods: {
    objToStr: objToStr,
    format: NKC.methods.format,
    getUrl: NKC.methods.tools.getUrl,
    create(){
      window.open("/oauth/creation", "_blank")
    },
  }
})
