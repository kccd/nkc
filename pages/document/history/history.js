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
function post(type, obj) {
  const url = `/document/history/${obj._id}/${type}?source=${obj.source}&sid=${obj.sid}`
  nkcAPI(url, 'POST')
    .then(() => {
      // localStorage.setItem('lastModify', new Date().getTime())
      sweetSuccess('操作成功')
      // let arr = currentUrl.split('/')
      // let prevUrl =  arr.slice(0, 6).join('/')
      location.reload()
    })
    .catch(err => {
      sweetError('操作失败,请重试')
      throw err;
    });
}