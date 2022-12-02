import {objToStr} from "../../../lib/js/tools";
import {HttpMethods, nkcUploadFile} from "../../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../../lib/js/sweetAlert";
import modifyOauthApp from "../../../lib/vue/modifyOauthApp";

const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    oauthList: data.oauthList,
    selectedOauthId: [],
    oauthStatus: data.oauthStatus,
    oauthOperations: data.oauthOperations,
  },
  components:{
    'modify-oauth-app': modifyOauthApp
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
    disableOauth(type, oauth){
      return Promise.resolve()
        .then(() => {
          return nkcAPI(
            `/e/settings/oauth/${oauth._id}/ban`,
            HttpMethods.PUT,
            {
              status: type? 'disabled' : 'normal'
            },
          );
        })
        .then(() => {
          sweetSuccess('操作成功');
        })
        .catch(sweetError)
    },
    deleteOauth(oauth){
      return Promise.resolve()
        .then(() => {
          return nkcAPI(
            `/e/settings/oauth/${oauth._id}`,
            HttpMethods.DELETE,
          );
        })
        .then(() => {
          sweetSuccess('删除成功');
        })
        .catch(sweetError)
    },
    editOauth(oauth){
      this.$refs.modifyOauth.open(oauth)
    }
  }
})
