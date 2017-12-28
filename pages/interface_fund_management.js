$(function(){

});
function deleteFund(name, money, id){
  if(confirm('确定要删除 ' + name+ '￥' + money + ' ？') === true) {
    nkcAPI('/fund/list/'+id, 'DELETE')
      .then(function() {
        window.location.reload();
      })
      .catch(function(err) {
        jwarning(err);
      })
  }
}