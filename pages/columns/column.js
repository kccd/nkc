var data = NKC.methods.getDataById("data");
var bodyBackgroundColor = data.color;
var CommonModal, SubscribeTypes;
$(function() {
  NKC.methods.initSelectColor(function(color) {
    $("body").css({
      "background-color": color
    });
    bodyBackgroundColor = color;
  });
  CommonModal = new NKC.modules.CommonModal();
  if(NKC.modules.SubscribeTypes) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  var columnSubscribe = $('.column-subscribe');
  var columnButton = columnSubscribe.find('.column-button');
  var columnNumber = columnSubscribe.find('.column-number');
  var columnId = columnSubscribe.attr('data-column-id');
  columnButton.on('click', function() {
    if(columnButton.attr('data-disabled') === 'true') return;
    var subscribed = columnSubscribe.attr('data-subscribed') === 'true';
    var number = Number(columnSubscribe.attr('data-number'));
    columnSubscribe.attr('data-subscribed', !subscribed);
    return Promise.resolve()
      .then(function() {
        columnButton.attr('data-disabled', 'true');
        return SubscribeTypes.subscribeColumnPromise(columnId, !subscribed);
      })
      .then(function() {
        number += subscribed? -1: 1;
        if(number <= 0) {
          columnNumber.addClass('hidden')
        } else {
          columnNumber.removeClass('hidden')
        }
        columnNumber.text(number);
        columnSubscribe.attr('data-number', number);
        columnSubscribe.attr('data-subscribed', !subscribed);

        columnButton.attr('data-disabled', 'false');

        /*if(subscribed) {
          screenTopAlert('取关成功');
        } else {
          screenTopAlert('关注成功');
        }*/

      })
      .catch(function(err) {
        columnButton.attr('data-disabled', 'false');
        sweetError(err);
      });
  });
});

function showSetDom() {
  $(".column-fast-set-body").toggle();
}
function showShareDom(){
  $(".column-share-body").toggle();
}
function saveSettings() {
  nkcAPI("/m/" + data.columnId, "PUT", {
    type: "color",
    color: bodyBackgroundColor
  })
    .then(function() {
      screenTopAlert("保存成功");
      showSetDom();
    })
    .catch(function(d) {
      screenTopWarning(d)
    })
}

function openNewWindow(url) {
  var origin = window.location.origin;
  var reg = new RegExp("^" + origin, "i");
  if(reg.test(url)) {
    openToNewLocation(url);
  } else {
    openToNewLocation(url, "_blank");
  }

}
function pushToHome(id, type) {
  var method = type === "push"? "POST": "DELETE";
  nkcAPI("/m/" + id + "/top", method)
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError);
}
function subscribeColumn(columnId) {
  if(!NKC.configs.uid) return NKC.methods.toLogin();
  var subscriptionButton = $('[data-type="subscriptionButton"][data-column-id="'+columnId+'"]');
  var subscriptionNumber = $('[data-type="subscriptionNumber"][data-column-id="'+columnId+'"]');
  var subscribed = subscriptionButton.attr('data-subscribed') === 'true';
  var number = Number(subscriptionNumber.attr('data-number'));

  return Promise.resolve()
    .then(function() {
      return SubscribeTypes.subscribeColumnPromise(columnId, !subscribed);
    })
    .then(function() {
      if(subscribed) {
        // 取消关注
        number --;
        subscriptionButton
          .attr('data-subscribed', 'false')
          .removeClass('btn-default')
          .addClass('btn-primary')
          .text('关注');
      } else {
        // 关注
        number ++;
        subscriptionButton
          .attr('data-subscribed', 'true')
          .removeClass('btn-primary')
          .addClass('btn-default')
          .text('已关注');
      }
      subscriptionNumber
        .attr('data-number', number)
        .text(NKC.methods.tools.briefNumber(number));
    })
    .catch(sweetError);
}