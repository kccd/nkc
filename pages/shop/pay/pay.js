function submit(ordersId) {
  var password = $('#password').val();
  var totalPrice = $("#totalPrice").text();
  nkcAPI('/shop/pay', 'POST', {
    ordersId: ordersId,
    password: password,
    totalPrice: totalPrice
  })
  .then(function() {
    hiddenInput();
    $('#success').removeClass('hidden');
    setTimeout(function() {
      // window.location.href = '/shop/order';
      openToNewLocation('/shop/order');
    }, 3000);
  })
  .catch(function(data) {
    screenTopWarning(data);
  });
}
function alipay(ordersId) {
  var newWindow = window.open();
  nkcAPI('/shop/pay/alipay?ordersId=' + ordersId, 'GET')
    .then(function(data) {
      newWindow.location = data.alipayUrl;
      selectAlipay();
    })
    .catch(function(data) {
      screenTopWarning(data);
    });
}
function hiddenInput() {
  var other = $('#otherPayment');
  var kcb = $('#kcbPayment');
  other.addClass('hidden');
  kcb.addClass('hidden');
}
function selectAlipay() {
  hiddenInput();
  var info = $('#info');
  info.removeClass('hidden');
}