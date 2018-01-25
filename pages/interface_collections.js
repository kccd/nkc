var cidbox = geid('cid')
var categorybox = geid('category')

function select(cid){
  cidbox.value = cidbox.value+cid+','
}

function extractSelectedCheckboxArrayOfID(){
  var k=[]
  $('.ThreadCheckboxes').each(function(){
    if(this.checked){
      k.push(this.id)
    }
  })
  return k

  //return cidbox.value.split(',').filter(function(item){return item.length>1})
}

function selectbtn(){
  //select all or deselect all
  if(extractSelectedCheckboxArrayOfID().length==0){
    $('.ThreadCheckboxes').each(function(){
      this.checked = true
    })
  }else{
    $('.ThreadCheckboxes').each(function(){
      this.checked = false
    })
  }
}

var movebutton = geid('movebtn')
//移动按钮
function movebtn(uid){
  var targetCategory = categorybox.value.trim()
  if(targetCategory.length==0){
    screenTopWarning('请填写分类')
    return
  }

  movebutton.disabled = true

  common.mapWithPromise(extractSelectedCheckboxArrayOfID(),function(item){
    return nkcAPI('/u/'+uid+'/collections/'+item,'PATCH',{cid:item,category:targetCategory})
    .then(function(){
      screenTopAlert(item + '移动到' +targetCategory)
    })
    .catch(function(data){
      screenTopWarning(item + '移动失败' + data.error)
    })
  })
  .then(function(){
    setTimeout(function(){
      window.location.reload()
    },1500)
  })
}

function moveTo(targetCategory){
  categorybox.value=targetCategory
  movebtn()
}

function deletebtn(uid){
  geid('deletebutton').disabled = true
  common.mapWithPromise(extractSelectedCheckboxArrayOfID(),function(item){
    return nkcAPI('/u/'+uid+'/collections/'+item, 'delete', {})
    .then(function(){
      screenTopAlert(item + '已删除')
    })
    .catch(function(data){
      screenTopWarning(item+ '删除失败' + data.error)
    })
  })
  .then(function(){
    setTimeout(function(){
      window.location.reload()
    },1500)
  })
}
