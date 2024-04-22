import {toLogin} from "../lib/js/account";
import {getState} from "../lib/js/state";
import {RNSetSharePanelStatus} from "../lib/js/reactNative";
import {shareTypes} from "../lib/js/shareTypes";
import ColumnPosts from '../lib/vue/column/ColumnPosts.vue';
import { nkcAPI } from "../lib/js/netAPI";
import { sweetError } from "../lib/js/sweetAlert";
const state = getState();
const logged = !!state.uid;

var data = NKC.methods.getDataById("data");
// 挂载所需要的vue实例对象
let app = null;
$(function () {
  const $element = document.getElementById('columnApp');
  if ($element) {
    moduleToColumn.init();
    const { column, columnPosts, category, topped, paging, user, toppedId } =
      NKC.methods.getDataById('columnAppData');
     app = new Vue({
      el: '#columnApp',
      components: {
        'column-posts': ColumnPosts,
      },
      data: {
        column,
        columnPosts: [...columnPosts].filter(item => !toppedId.includes(item._id)),
        category,
        topped,
        paging,
        user,
        toppedId,
        showSettingButton: false,
      },
      methods: {
        getPostList() {
          if (!this.column) {
            return;
          }
          const self = this;
          let query = `?page=${this.paging.page}`;
          if (this.category) {
            const urlParams = new URLSearchParams(window.location.search);
            const c = urlParams.get('c') || '';
            query += `&c=${this.category._id}`;
            if (c.split('-').length === 2 && !isNaN(Number(c.split('-')[1]))) {
              query += `-${c.split('-')[1]}`;
            }
          }
          //请求服务器数据
          nkcAPI('/api/v1/column/' + this.column._id + query, 'GET')
            .then(function (data) {
              const {
                column,
                columnPosts,
                category,
                topped,
                paging,
                toppedId,
              } = data.data;
              self.column = column;
              self.columnPosts = [...columnPosts].filter(item => !toppedId.includes(item._id));
              self.category = category;
              self.topped = topped;
              self.paging = paging;
              self.toppedId = toppedId;
            })
            .catch(function (err) {
              sweetError(err);
            });
        },
      },
    });
  }
});
var SubscribeTypes = window.SubscribeTypes;
$(function() {
  if(data.columnId){
    RNSetSharePanelStatus(true, shareTypes.column, data.columnId);
  }else {
    if(data.type === 'article'){
      RNSetSharePanelStatus(true, shareTypes.article, data.article.id);
    }else {
      RNSetSharePanelStatus(true, shareTypes.thread, data.article.tid);
    }
  }
});
$(function() {
  if(!window.CommonModal) {
    window.CommonModal = new NKC.modules.CommonModal();
  }
  if(!SubscribeTypes && logged) {
    SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
});
var bodyBackgroundColor = data.color;
var listBackgroundColor = data.listColor;
var toolsBackgroundColor = data.toolColor;
var CommonModal = window.CommonModal;
$(function() {
  NKC.methods.initSelectColor(function(color, id) {
    if(id === 'columnColor') {
      // 专栏背景颜色
      $("body").css({
        "background-color": color
      });
      bodyBackgroundColor = color;
    } else if(id === 'listColor') {
      // 文章列表背景颜色
      console.log(color)
      $(".column-thread-list-container").css({
        "background-color": color
      });
      listBackgroundColor = color;
    } else if(id === 'toolColor'){
      // 文章工具背景颜色
      $(".column-tool-container").css({
        "background-color": color
      });
      toolsBackgroundColor = color;
    }
  });
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
    color: bodyBackgroundColor,
    listColor: listBackgroundColor,
    toolColor: toolsBackgroundColor
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
  nkcAPI("/m/" + id + "/hot", method)
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError);
}
function toppedColumn(id, type) {
  var method = type === 'push'? 'POST': 'DELETE';
  nkcAPI("/m/" + id + "/top", method)
    .then(function() {
      window.location.reload();
    })
    .catch(sweetError)
}
function subscribeColumn(columnId) {
  if(!NKC.configs.uid) return toLogin();
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
          .text('订阅');
      } else {
        // 关注
        number ++;
        subscriptionButton
          .attr('data-subscribed', 'true')
          .removeClass('btn-primary')
          .addClass('btn-default')
          .text('退订');
      }
      subscriptionNumber
        .attr('data-number', number)
        .text(NKC.methods.tools.briefNumber(number));
    })
    .catch(sweetError);
}

function editColumnPosts(isEdit) {
  if(isEdit){
    $('#columnPug').hide();
    $('#columnApp').show();
    if(app){
      app.showSettingButton = true;
    }
    
  }else{
    if(app){
      app.showSettingButton = false;
    }
    
  }
  
}
Object.assign(window, {
  bodyBackgroundColor,
  CommonModal,
  SubscribeTypes,
  showSetDom,
  showShareDom,
  saveSettings,
  openNewWindow,
  pushToHome,
  subscribeColumn,
  toppedColumn,
  editColumnPosts
});
