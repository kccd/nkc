function comfirmReceipt(orderId) {
  sweetQuestion("确认收货后，货款将打入卖家账户，请再次确认。")
    .then(() => {
      nkcAPI('/shop/order/'+orderId+'/receipt', "PATCH", {})
        .then(function(data) {
          sweetSuccess("执行成功");
          window.location.reload();
        })
        .catch(sweetError)
    })
    .catch(err => null)
}