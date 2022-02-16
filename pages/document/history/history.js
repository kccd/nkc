import { nkcAPI } from "../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";
import { sweetQuestion } from '../../lib/js/sweetAlert'
// window.publish=publish
window.saveArticle=saveArticle
var currentUrl;
onload = ()=>{
  currentUrl = window.location.href
}
// function publish(data){
//   const newdata = JSON.parse(data)
//   sweetQuestion('确定要将当前项发布吗？').then(()=>{
//     post('publish', newdata)
//   })
// }
function saveArticle(data){
  const newdata = JSON.parse(data)
  sweetQuestion('确定要将当前项添加到创作中心进行编辑吗？').then(()=>{
    post('edit', newdata)
  })
}
function post(type, newdata) {
  const url = `/document/335/history/${newdata.did}/${newdata._id}/${type}`
  nkcAPI(url, 'POST')
    .then(() => {
      sweetSuccess('操作成功')
      let arr = currentUrl.split('/')
      let prevUrl =  arr.slice(0, 6).join('/')
      location.replace(prevUrl)
    })
    .catch(err => {
      sweetError('操作失败,请重试')
      throw err;
    });
}