import { nkcAPI } from '../lib/js/netAPI';
import { sweetError } from '../lib/js/sweetAlert';
import { getState } from '../lib/js/state';
const state = getState();

if (!window.SubscribeTypes && NKC.modules.SubscribeTypes) {
  window.SubscribeTypes = new NKC.modules.SubscribeTypes();
}
window.subscribeColumn = function (columnId) {
  if (!state.uid) {
    return window.RootApp.openLoginPanel();
  }
  var dom = $(
    '.column[data-column-id="' + columnId + '"] .column-subscription',
  );
  var subscribed = dom.attr('data-subscribed');
  if (subscribed === 'true') {
    // 取消关注
    SubscribeTypes.subscribeColumnPromise(columnId, false)
      .then(function () {
        dom
          .attr('data-subscribed', 'false')
          .removeClass('btn-default')
          .addClass('btn-primary')
          .text('关注');
      })
      .catch(sweetError);
  } else {
    // 关注
    SubscribeTypes.subscribeColumnPromise(columnId, true)
      .then(function () {
        dom
          .attr('data-subscribed', 'true')
          .removeClass('btn-primary')
          .addClass('btn-default')
          .text('已关注');
      })
      .catch(sweetError);
  }
};
window.setColumnHot = function (columnId) {
  var dom = $('.column[data-column-id="' + columnId + '"] .column-hot');
  var hot = dom.attr('data-hot');
  if (hot === 'true') {
    // 取消热门
    nkcAPI('/m/' + columnId + '/hot', 'DELETE')
      .then(function () {
        dom.attr('data-hot', 'false');
        dom.text('设为热门');
        dom.removeClass('btn-danger').addClass('btn-default');
      })
      .catch(sweetError);
  } else {
    // 设为热门
    nkcAPI('/m/' + columnId + '/hot', 'POST')
      .then(function () {
        dom.attr('data-hot', 'true');
        dom.text('取消热门');
        dom.removeClass('btn-default').addClass('btn-danger');
      })
      .catch(sweetError);
  }
};

window.setColumnTopped = function (columnId) {
  var dom = $('.column[data-column-id="' + columnId + '"] .column-top');
  var top = dom.attr('data-top');
  if (top === 'true') {
    // 取消热门
    nkcAPI('/m/' + columnId + '/top', 'DELETE')
      .then(function () {
        dom.attr('data-top', 'false');
        dom.text('置顶');
        dom.removeClass('btn-danger').addClass('btn-default');
      })
      .catch(sweetError);
  } else {
    // 设为热门
    nkcAPI('/m/' + columnId + '/top', 'POST')
      .then(function () {
        dom.attr('data-top', 'true');
        dom.text('取消置顶');
        dom.removeClass('btn-default').addClass('btn-danger');
      })
      .catch(sweetError);
  }
};
