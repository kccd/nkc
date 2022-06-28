import Share from '../../lib/vue/Share';
import {RNSetSharePanelStatus} from "../../lib/js/reactNative";
import {shareTypes} from "../../lib/js/shareTypes";
const element = document.getElementById('applicationFormShare');
if(element) {
  const app = new Vue({
    el: element,
    components: {
      share: Share
    }
  })
}
var data = NKC.methods.getDataById("data");
$(function() {
  RNSetSharePanelStatus(true, shareTypes.fundForm, data._id);
});
