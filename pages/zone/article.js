import {RNSetSharePanelStatus} from "../lib/js/reactNative";
import {getDataById} from "../lib/js/dataConversion";
import MoveBox from '../lib/vue/publicVue/moveThreadOrArticle/MoveBox.vue';

const data = getDataById('data');
RNSetSharePanelStatus(true,'article',data.article.id)
const MoveCategoryBoxAppInZone = new Vue({
  el: "#moveCategoryBoxAppInZone",
  components: {
    'move-box': MoveBox,
  },
  methods:{
    open(){
      this.$refs.moveCategoryBox.open(()=>{},{article: data.article})
    }
  },
})
function openMoveArticleCategory(){
  MoveCategoryBoxAppInZone.open()
}
Object.assign(window, {
  openMoveArticleCategory
})
