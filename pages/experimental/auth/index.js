import Vue from 'vue'
const data = NKC.methods.getDataById('data');

var targetUid = $('.photoType').attr('targetUid');
$(function(){
	var radioName = [];
	var arr = $('.photoType');
	for(var i = 0; i < arr.length; i++){
		var name = arr.eq(i).attr('name');
		radioName.push(name);
		displayInput(name);
		disappearInput(name);
		submit(name);
	}
});
function displayInput(name) {
	$('input[name='+name+']').eq(1).on('click', function() {
		$('#'+name+'Reason').show();
		$('#'+name+'Time').hide();
	})
}

function disappearInput(name) {
	$('input[name='+name+']').eq(0).on('click', function() {
		$('#'+name+'Reason').hide();
		$('#'+name+'Time').show();
	})
}

function submit(name){
	$('#'+name+'Submit').on('click', function() {
		var status, time = null;
		var reason = $('#'+name+'Reason').val();
		var timeArr = $('#'+name+'Time input');
		var year = timeArr.eq(0).val();
		var month = timeArr.eq(1).val();
		var day = timeArr.eq(2).val();
		var chooseTrue = $('input[name='+name+']').eq(0).is(':checked');
		var chooseFalse = $('input[name='+name+']').eq(1).is(':checked');
		if(!chooseFalse && !chooseTrue) {
			return screenTopWarning('请选择同意或不同意后再点击提交!');
		}
		if(chooseFalse) {
			status = false;
			if(reason === '') {
				return screenTopWarning('请输入原因！');
			}
		} else {
			status = true;
			reason = '';
			if(year === '' || month === '' || day === '') {
				return screenTopAlert('请输入正确的时间！');
			}
			time = new Date(year + ' ' + month + ' ' + day);
			if(!time) return screenTopWarning('请输入正确的时间！');
		}
		nkcAPI('/auth/'+targetUid, 'PUT', {reason: reason, status: status, type: name, time: time})
			.then(function(){
				screenTopAlert('提交成功！');
			})
			.catch(function(data) {
				screenTopWarning(data.error);
			})
	});
}

new Vue({
	el: "#app",
	data: {
		searchType: data.searchType || 'username',
		searchContent: data.searchContent || '',
		checkbox: {
			auth1: true,
			auth2: true,
		},
		btnType: '',
		btnTypeUrl: {
			'waiting-review': "/e/auth?type=waiting-review",
			all: '/e/auth?type=auth1-2'
		}
	},
	mounted() {
		this.initCheckbox()
	},
	methods: {
		selectedBtn(btnType) {
			this.btnType = btnType;

			window.location.href = this.btnTypeUrl[btnType];
		},
		resetSearch() {
			this.searchType = 'username';
			this.searchContent = '';
			// 得区分点的是全部还是待审核
			if (this.btnType === 'waiting-review') {
				window.location.href = this.btnTypeUrl['waiting-review'];
			} else {
				window.location.href = window.location.href.replace(/(c)(.n)(&exp)/, '')
			}
		},
		selectedCheckBox() {
			const {searchType, searchContent, checkbox: {auth1, auth2}} = this;
			if (auth1 || auth2) {
				const allFilter = auth1 && auth2 ? 'auth1-2' : auth1 ? 'auth1' : 'auth2';
				window.location.href = `/e/auth?c=${searchType},${searchContent}&type=${allFilter}`;
			} else {
				window.location.href = `/e/auth?c=${searchType},${searchContent}`;
			}
		},
		initCheckbox() {
			['auth1','auth2', 'auth1-2'].forEach((item) => {
				if (item === 'auth1-2' && window.location.search.includes(item)) {
					this.checkbox['auth1'] = true
					this.checkbox['auth2'] = true
				} else {
					window.location.search.includes(item) ? (this.checkbox[item] = true) : (this.checkbox[item] = false)
				}
			})
		},
		activeWaitingReview() {
			return (window.location.pathname === '/e/auth?type=waiting-review')
		},
		search() {
			const {searchType, searchContent} = this;
			if(!searchContent) return sweetError('请输入搜索内容');
			if (this.btnType === 'waiting-review') {
				window.location.href = `/e/auth?c=${searchType},${searchContent}`;
			} else {
				this.selectedCheckBox();
			}
		},
		resetInput(){
			this.searchContent = '';
		}
	}
})

Object.assign(window, {
	targetUid,
	displayInput,
	disappearInput,
	submit,
});
