function addToCard(id) {
  var hasLogged = NKC.config.hasLogged;
  if(hasLogged) {
    kcAPI('/shop/cart', 'POST', {productId: id})
      .then(function() {

      })
      .catch(function() {

      });
  }
}