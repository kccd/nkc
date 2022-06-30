import { nkcAPI } from "../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";
import { sweetQuestion } from '../../lib/js/sweetAlert'
// window.publish=publish
window.saveArticle=saveArticle
onload = ()=>{
  document.body.style='display:block'
  // currentUrl = window.location.href
}

function saveArticle(data){
  const newdata = JSON.parse(data)
  sweetQuestion('确定要基于当前版本继续创作吗？').then(()=>{
    post('edit', newdata)
  })
}
function post(type, obj) {
  const url = `/draft/history/${obj._id}/${type}?source=${obj.source}&desTypeId=${obj.desTypeId}`
  nkcAPI(url, 'POST')
    .then(() => {
      location.href=`/editor?type=newThread&aid=${obj._id}`;
    })
    .catch(err => {
      sweetError(err)
      throw err;
    });
}
// Object.assign(window, {originTitle})
// function originTitle(){
//   if($('#dropdown').hasClass('open')){
//     $('#dropdown').removeClass('open');
//   }else{
//     $('#dropdown').addClass('open');
//   }
// }
