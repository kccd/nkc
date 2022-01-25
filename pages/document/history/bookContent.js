import {nkcUploadFile, nkcAPI} from "../../lib/js/netAPI";
import {sweetError, sweetSuccess} from "../../lib/js/sweetAlert";
import { sweetQuestion } from '../../lib/js/sweetAlert'
window.publish=publish
window.saveArticle=saveArticle
function publish(data, bid){
  const newdata=JSON.parse(data)
  sweetQuestion('确定要将当前项发布吗？').then(()=>{
    post('publish', '', newdata, bid)
  })
}
function saveArticle(data,bid){
  const newdata=JSON.parse(data)
  sweetQuestion('确定要将当前项添加到创作中心进行编辑吗？').then(()=>{
    post('save', '', newdata, bid)
  })
}
function post(type,articleType,{  uid, title, content, _id, did, toc ,dt, type:version, sid, cover }, bid) {
  const formData = new FormData();
  if(sid) {
    formData.append('articleId', sid);
  }
  const article={
    title,
    content,
    cover
  }
  formData.append('bookId', bid);
  formData.append('article', JSON.stringify(article));
  formData.append('type', type);
  formData.append('articleType', articleType);
  formData.append('level', 'outermost');
  let url='/creation/articles/editor'
  return nkcUploadFile(url, 'POST', formData)
    .then(data => {
      sessionStorage.document_id=data.document?._id
      sweetSuccess('操作成功')
    })
    .catch(err => {
      sweetError('操作失败,请重试')
      throw err;
    });
}