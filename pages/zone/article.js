import {RNSetSharePanelStatus} from "../lib/js/reactNative";
import {getDataById} from "../lib/js/dataConversion";
import MoveCategory from '../lib/vue/publicVue/moveThreadOrArticle/MoveCategory';

const data = getDataById('data');
RNSetSharePanelStatus(true,'article',data.article.id)
const MoveCategoryApp = new Vue({
  el: "#moveCategoryApp",
  components: {
    'move-category': MoveCategory,
  },
  methods:{
    open(){
      console.log(this.$refs.moveCategoryList.open(()=>{},{source:'article'}))
    }
  },
})
function openMoveArticleCategory(){
  MoveCategoryApp.open()
}
Object.assign(window, {
  openMoveArticleCategory
})
