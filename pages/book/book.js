window.typeConversion=typeConversion
function typeConversion(type){
  console.log(type)
  const  map={
    article:'文章',
    url:'链接',
    text:'分组',
    post:'post',
  }
  return map[type]
}