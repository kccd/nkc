/* 
  添加商品到购物车
  已登录用户：将商品存在相应用户的购物车里；
  游客：写入cookie，待用户登录后再将cookie中的数据存到购物车里；
  @param id: 商品ID
  @author pengxiguaa 2019/3/4
*/
function addToCard(id) {
  kcAPI('/shop/cart', 'POST', {productId: id})
    .then(function() {
      screenTopAlert('添加成功');
    })
    .catch(function(err) {
      screenTopWarning(err);
    });
}