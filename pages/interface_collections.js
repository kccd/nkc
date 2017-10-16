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
function movebtn(){
  var targetCategory = categorybox.value.trim()
  if(targetCategory.length==0){
    screenTopWarning('请填写分类')
    return
  }

  movebutton.disabled = true

  common.mapWithPromise(extractSelectedCheckboxArrayOfID(),function(item){
    return nkcAPI('moveCollectionItemToCategory',{cid:item,category:targetCategory})
    .then(function(){
      screenTopAlert(item + '移动到' +targetCategory)
    })
    .catch(function(){
      screenTopWarning(item+ '移动失败')
    })
  })
  .then(function(){
    window.location.reload()
  })
}

function moveTo(targetCategory){
  categorybox.value=targetCategory
  movebtn()
}

function deletebtn(){
  geid('deletebutton').disabled = true
  common.mapWithPromise(extractSelectedCheckboxArrayOfID(),function(item){

    return nkcAPI('removeCollectionItem',{
      cid:item
    })
    .then(function(){
      screenTopAlert(item + '已删除')
    })
    .catch(function(){
      screenTopWarning(item+ '删除失败')
    })
  })
  .then(function(){
    window.location.reload()
  })
}
