/**
 * 新增店内分类
 */
function addClassify(storeId) {
  var newClassifyName = prompt("Please enter newClassify","")
  newClassifyName = newClassifyName.trim();
  if (newClassifyName){
    nkcAPI('/shop/manage/'+storeId+'/classify/add', "POST", {newClassifyName})
    .then(function(data) {
      screenTopAlert("添加成功");
      window.location.href = '/shop/manage/'+storeId+'/classify';
    })
    .catch(function(data) {
      screenTopWarning(data || data.error);
    })
  }
}

/**
 * 删除店内分类
 */
function delClassify(storeId, name) {
  var classifyName = name.trim();
  nkcAPI('/shop/manage/'+storeId+'/classify/del', "POST", {classifyName})
  .then(function(data) {
    screenTopAlert("删除成功");
    window.location.href = '/shop/manage/'+storeId+'/classify';
  })
  .catch(function(data) {
    screenTopWarning(data || data.error)
  })
}