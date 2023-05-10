import { sweetQuestion, sweetSuccess, sweetError } from './sweetAlert';
import { nkcAPI } from './netAPI';
import { screenTopAlert } from './topAlert';
import { visitUrl } from './pageSwitch';

export function banSale(productId, disabled) {
  sweetQuestion('确定要执行当前操作吗？').then(() => {
    nkcAPI('/shop/product/' + productId + '/banSale', 'PUT', {
      productId: productId,
      disabled: !!disabled,
    })
      .then(function () {
        sweetSuccess(`执行成功`);
      })
      .catch(sweetError);
  });
}

export function addProductToCart(props) {
  const { count, productParamId, freightId } = props;
  nkcAPI('/shop/cart', 'POST', {
    productParamId,
    count,
    freightId,
  })
    .then(function () {
      screenTopAlert('已添加到购物车');
    })
    .catch(sweetError);
}

export function submitProductToBill(props) {
  const { count, productParamId, freightId } = props;
  let url = '/shop/bill?paraId=' + productParamId + '&productCount=' + count;
  if (freightId) {
    url += `&freightId=${freightId}`;
  }
  visitUrl(url, true);
}
