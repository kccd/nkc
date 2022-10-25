import Moments from '../lib/vue/zone/Moments';
import {getDataById} from "../lib/js/dataConversion";
import {clearUserPublicProfile} from "../lib/js/user";

const data = getDataById('data');

const moment = new Vue({
  el: "#moment",
  components: {
    'moments': Moments,
  },
  data: {
    momentsData: data.momentsData
  }
});



window.checkbox = undefined;
window.checkboxBody = undefined;
window.SubscribeTypes = undefined;
$(function() {
  window.checkbox = $(".post-checkbox input[type='checkbox']");
  window.checkboxBody = $(".post-checkbox label");
  if(window.moduleToColumn) {
    moduleToColumn.init();
  }
  if(!window.SubscribeTypes && NKC.modules.SubscribeTypes) {
    window.SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
});
function managementPosts() {
  var btn = $("a.button[onclick='managementPosts()']");
  if(btn.hasClass("radius-right")) {
    btn.removeClass("radius-right");
  } else {
    btn.addClass("radius-right");
  }
  checkboxBody.toggle();
  $(".post-management-button").toggle();
}

function selectAll() {
  var total = checkbox.length;
  var checked = 0;
  for(var i = 0; i < total; i++) {
    if(checkbox.get(0).checked) {
      checked++;
    }
  }
  if(total === checked) {
    checkbox.prop("checked", false);
  } else {
    checkbox.prop("checked", true);
  }
}

function toColumn() {
  var pid = [];
  for(var i = 0; i < checkbox.length; i++) {
    if(checkbox.get(i).checked) {
      var id = checkbox.eq(i).attr("data-pid");
      pid.push(id);
    }
  }
  if(pid.length === 0) return;
  moduleToColumn.show(function(data) {
    var categoriesId = data.categoriesId;
    var columnId = data.columnId;
    nkcAPI("/m/" + columnId + "/post", "POST", {
      categoriesId: categoriesId,
      type: "addToColumn",
      postsId: pid
    })
      .then(function() {
        screenTopAlert("操作成功");
        moduleToColumn.hide();
      })
      .catch(function(data) {
        screenTopWarning(data);
      });
  }, {
    selectMul: true
  });
}

/*
* 清除用户信息
* @param {String} uid 用户ID
* @param {String} type 类型， 可选：avatar、banner、description、username
* @author pengxiguaa 2019-7-26
* */
function clearUserInfo(uid, type) {
  return clearUserPublicProfile(uid, type);
}

/**
 * 隐藏和显示用户主页
 * @param {boolean} - 是否隐藏用户主页
 * @param {string} - 目标用户id
 */
function hideUserHome(isHidden, uid) {
  return nkcAPI("/u/" + uid + "/hide", "POST", {setHidden: isHidden})
    .catch(sweetError)
    .then(function() {location.reload()});
}

function checkUserCode() {
  return sweetPrompt('请输入动态码')
    .then(code => {
      return nkcAPI(`/u/${data.uid}/code`, 'POST', {code})
    })
    .then(() => {
      sweetSuccess('验证通过');
    })
    .catch(err => {
      sweetError(err);
    });
}

Object.assign(window, {
  managementPosts,
  checkUserCode,
  selectAll,
  toColumn,
  clearUserInfo,
  hideUserHome,
});
