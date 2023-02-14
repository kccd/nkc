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
      let article;
      if(!data.article.tcId || (data.article.tcId && data.article.tcId.length ===0)){
        article={tcId: data.allCategories.map(item=>Number(item.defaultNode)).filter(Boolean) || []}
      }else{
        article={tcId: data.article.tcId || []}
      }
      article._id = data.article._id
      this.$refs.moveCategoryBox.open(()=>{},{article})
    }
  },
})
function openMoveArticleCategory(){
  MoveCategoryBoxAppInZone.open()
}
Object.assign(window, {
  openMoveArticleCategory
})
