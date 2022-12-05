import {objToStr} from "../../../lib/js/tools";
import {HttpMethods} from "../../../lib/js/netAPI";
import {sweetConfirm, sweetError, sweetQuestion, sweetSuccess} from "../../../lib/js/sweetAlert";
import CreationAndModifyOauthApp from "../../../lib/vue/CreationAndModifyOauthApp";

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
    'creation-modify-oauth-app': CreationAndModifyOauthApp
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
      this.$refs.modifyOauth.open('', 'create')
    },
    disableOauth(type, oauth){
      return Promise.resolve()
        .then(() => {
          return nkcAPI(
            `/e/settings/oauth/manage/${oauth._id}/ban`,
            HttpMethods.PUT,
            {
              status: type? 'disabled' : 'normal'
            },
          );
        })
        .then(() => {
          sweetSuccess('操作成功');
          location.reload();
        })
        .catch(sweetError)
    },
    deleteOauth(oauth){
      sweetConfirm('确定要删除当前应用吗？该操作无法撤回').then(()=>{
        return Promise.resolve()
          .then(() => {
            return nkcAPI(
              `/e/settings/oauth/manage/${oauth._id}`,
              HttpMethods.DELETE,
            );
          })
          .then(() => {
            sweetSuccess('删除成功');
            location.reload();
          })
          .catch(sweetError)
      })

    },
    editOauth(oauth){
      this.$refs.modifyOauth.open(oauth, 'modify')
    },
    getOauthKey(oauth){
      sweetInfo(`${oauth.name}的密钥：${oauth.secret}`)
    },
    upDataOauth(oauth){
      sweetQuestion('确定要更新密钥吗？当前操作无法撤回').then(() => {
        return nkcAPI(
          `/e/settings/oauth/manage/${oauth._id}/secret`,
          HttpMethods.POST,
        );
      }).then(() => {
        sweetSuccess('更新成功');
        setTimeout(function() {
          window.location.reload();
        }, 2000)
      })
    }
  }
})
