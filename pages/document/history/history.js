import { nkcAPI } from "../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";
import { sweetQuestion } from '../../lib/js/sweetAlert'
// window.publish=publish
window.saveArticle=saveArticle
onload = ()=>{
  document.body.style='display:block'
  currentUrl = window.location.href
}
function saveArticle(data){
  const newdata = JSON.parse(data)
  sweetQuestion('确定要将当前项添加到创作中心进行编辑吗？').then(()=>{
    post('edit', newdata)
  })
}
function post(type, obj) {
  const url = `/document/history/${obj._id}/${type}?source=${obj.source}&sid=${obj.sid}`
  nkcAPI(url, 'POST')
    .then(() => {
      window.open(obj.editorUrl.editorUrl);
    })
    .catch(err => {
      sweetError('操作失败,请重试')
      throw err;
    });
}