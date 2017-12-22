$(function(){

});
function deleteFund(id){
  if(confirm('删除基金'+ id) === true) {
    nkcAPI('/fund/management/'+id, 'DELETE')
      .then(function() {
        window.location.reload();
      })
      .catch(function(err) {
        jwarning(err);
      })
  }
}