/* 
  添加商品到购物车
  @param id: 商品规格ID
  @param count: 添加到购物车的商品数量
  @author pengxiguaa 2019/3/4
*/
function addToCard(id, count) {
  kcAPI('/shop/cart', 'POST', {productParamId: id, count: count})
    .then(function() {
      screenTopAlert('添加成功');
    })
    .catch(function(err) {
      screenTopWarning(err);
    });
}