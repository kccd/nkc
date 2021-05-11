$(function(){

});
function deleteFund(name, money, id){
  if(confirm('确定要删除 ' + name+ '￥' + money + ' ？') === true) {
    nkcAPI('/fund/list/'+id, 'DELETE')
      .then(function() {
        window.location.reload();
      })
      .catch(function(data) {
        screenTopWarning(data.error);
      })
  }
}

function openToEditFundManage(url) {
  openToNewLocation(url);
}

Object.assign(window, {
  deleteFund,
  openToEditFundManage,
});