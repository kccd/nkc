// $(document).ready(function() {
// 	var qrcode = geid('qrcode');
// 	if(qrcode) {
// 		var path = window.location.href;
// 		path = path.replace(/\?.*/g, '');
// 		QRCode.toCanvas(qrcode, path, {
// 			scale: 3,
// 			margin: 1,
// 			color: {dark: '#000000'}
// 		}, function(err) {
// 			if(err){
// 				screenTopWarning(err);
// 			}
// 		})
// 	}
// })

function agree(_id) {
	nkcAPI('/fund/a/'+_id+'/member', 'PUT', {agree: true})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function disagree(_id) {
	nkcAPI('/fund/a/'+_id+'/member', 'PUT', {agree: false})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function support(_id) {
	var content = $('#content').val();
	var obj = {
		type: 'support',
		c: content
	};
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', obj)
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function against(_id) {
	var content = $('#content').val();
	if(!content) {
		screenTopWarning('请输入反对的理由。');
		return;
	}
	var obj = {
		type: 'against',
		c: content
	};
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', obj)
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

let giveUpReason = '';

function revoked(type, _id) {
	if(type === 'giveUp') {
	  return sweetPrompt(`请输入放弃的原因`, giveUpReason)
      .then((reason) => {
        giveUpReason = reason;
        return nkcAPI(`/fund/a/${_id}/settings/giveup`, 'POST', {reason});
      })
      .then(function(){
        sweetSuccess(`操作成功`);
      })
      .catch(function(data){
        sweetError(data);
      });
	}
}

function disableApplicationForm(id, type) {
	if(type === true && confirm('确定要封禁该基金申请？') === false) return;
	nkcAPI('/fund/a/'+id+'/disabled', 'PUT',{type: type})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function excellent(id, type) {
	nkcAPI('/fund/a/'+id+'/excellent', 'PUT', {type: type})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


function submitComment(id) {
	var comment = $('#commentContent').val();
	if(!comment) return screenTopWarning('请输入评论内容。');
	var obj = {
		c: comment
	};
	nkcAPI('/fund/a/'+id+'/comment', 'POST', {comment: obj})
		.then(function() {
			window.location.reload();
		})
		.catch(function (data) {
			screenTopWarning(data.error);
		})
}

function disabledComment(applicationFormId, commentId, type) {
	nkcAPI('/fund/a/'+applicationFormId+'/comment/'+commentId+'?type='+type, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function restoreApplicationForm(id) {
	nkcAPI('/fund/a/'+id + '/manage/restore', 'POST', {})
		.then(function() {
			sweetSuccess('执行成功');
		})
		.catch(function(data) {
		  sweetError(data);
		})
}
function disabledReport(applicationFormId, reportId, type) {
	nkcAPI('/fund/a/'+applicationFormId+'/report/'+reportId+'?type='+type, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

import {
  addUserToFundBlacklist,
  removeUserFromFundBlacklist
} from "./fund/blacklist/lib";

Object.assign(window, {
	agree,
	disagree,
	support,
	against,
	revoked,
	disableApplicationForm,
	excellent,
	submitComment,
	disabledComment,
	restoreApplicationForm,
	disabledReport,
  addUserToFundBlacklist,
  removeUserFromFundBlacklist
});
