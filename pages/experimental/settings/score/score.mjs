function saveNumberSettings() {
  var coefficients = {
    postToForum: $('#postToForum').val(),
    postToThread: $('#postToThread').val(),
    digest: $('#digest').val(),
    digestPost: $('#digestPost').val(),
    dailyLogin: $('#dailyLogin').val(),
    xsf: $('#xsf').val(),
    thumbsUp: $('#thumbsUp').val(),
    violation: $('#violation').val()
  };
  nkcAPI('/e/settings/number', 'PATCH', {coefficients: coefficients})
    .then(function() {
      screenTopAlert('保存成功');
    })
    .catch(function(data) {
      screenTopWarning(data.error||data);
    })
}

function updateFormula() {
  var dailyLogin = $('#dailyLogin').val();
  var postToForum = $('#postToForum').val();
  var postToThread = $('#postToThread').val();
  var digest = $('#digest').val();
  var digestPost_ = $('#digestPost').val();
  var thumbsUp = $('#thumbsUp').val();
  var violation = $('#violation').val();
  var xsf = $('#xsf').val();

  var text = '公式：(在线天数 x ' + dailyLogin + ') + ' + '(文章数 x ' + postToForum + ') + (' + '回复数 x ' + postToThread + ') + (' + '精选文章数 x ' + digest + ') + (' + '精选回复数 x ' + digestPost_ + ') + (' + '被点赞数^(1/2) x ' + thumbsUp + ') + (' + '学术分 x ' + xsf + ') + (' + '违规数 x ' + violation + ')';
  $('#formula').text(text);
}

$(function() {
  updateFormula();
  $('.formula input').on('input', function() {
    updateFormula();
  });
});

const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {

  },
  methods: {

  }
});
