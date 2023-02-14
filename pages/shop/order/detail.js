const dataInput = $('.data-input');
const dataValue = $('.data-value');
const locationInput = $('input[data-type="location"]');
const addressInput = $('input[data-type="address"]');
const nameInput = $('input[data-type="name"]');
const mobileInput = $('input[data-type="mobile"]');

const SelectAddress = new NKC.modules.SelectAddress();

window.selectLocation = function() {
  SelectAddress.open(location => {
    locationInput.val(location.join(' '));
  })
}

function showInput() {
  dataInput.removeClass('hidden');
  dataValue.addClass('hidden');
}

function hideInput() {
  dataInput.addClass('hidden');
  dataValue.removeClass('hidden');
}

window.submitAddress = function(orderId) {
  const address = addressInput.val();
  const location = locationInput.val();
  const name = nameInput.val();
  const mobile = mobileInput.val();
  return Promise.resolve()
    .then(() => {
      if(location.length === 0) {
        throw new Error('行政区域不能为空');
      }
      if(address.length === 0) {
        throw new Error('详细地址不能为空');
      }
      return nkcAPI(`/shop/order/${orderId}/delivery`, 'PUT', {
        receiveMobile: mobile,
        receiveName: name,
        receiveAddress: location + " " + address,
      })
    })
    .then(() => {
      sweetSuccess('提交成功');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    })
    .catch(sweetError);
}

window.modifyAddress = function() {
  if(dataInput.hasClass('hidden')) {
    showInput();
  } else {
    hideInput();
  }
};

