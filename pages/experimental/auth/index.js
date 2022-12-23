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
			auth3: true,
		},
		btnType: '',
		btnTypeUrl: {
			'waiting-review': "/e/auth?type=waiting-review",
			all: '/e/auth?type=auth,1-2-3'
		}
	},
	mounted() {
		this.initCheckbox()
		this.initBtnType()
	},
	methods: {
		paging(page) {
			if(page !== undefined) {
				const {searchType, searchContent, checkbox: {auth1, auth2, auth3}} = this;
				if (this.btnType === 'waiting-review') {
					window.location.href = `/e/auth?c=${searchType},${searchContent}&page=${page}`;
				} else {
					this.selectedCheckBox(page);
				}
			}
		},
		selectedBtn(btnType) {
			this.btnType = btnType;
			window.location.href = this.btnTypeUrl[btnType];
		},
		initBtnType() {
			this.btnType = window.location.search.includes('waiting-review') ? 'waiting-review' : 'all'
		},
		resetSearch() {
			this.searchType = 'username';
			this.searchContent = '';
			// 得区分点的是全部还是待审核
			if (this.btnType === 'waiting-review') {
				window.location.href = this.btnTypeUrl['waiting-review'];
			} else {
				this.selectedCheckBox()
			}
		},
		selectedCheckBox(page=0) {
			const {searchType, searchContent, checkbox: {auth1, auth2, auth3}} = this;
			
			let selected = 'auth,';
			
				[auth1, auth2, auth3].forEach((item, i) => {
				if (item) {
					selected += `${selected === 'auth,' ? i+1 : '-' + (i+1)}`
				}
			});
			window.location.href = `/e/auth?c=${searchType},${searchContent}&type=${selected}&page=${page}`;
			
		},
		initCheckbox() {
			const typeSearch = new URLSearchParams(window.location.search).get('type');
			const delimiter = ','
			if (typeSearch && typeSearch.includes('auth')) {
				const arr = typeSearch.split(delimiter);
				const part1 = arr[0];
				const part2 = arr[1].includes('-') ? arr[1].split('-').map(s => part1 + s) : part1 + arr[1];
				['auth1','auth2', 'auth3'].forEach((item, i) => {
					if (part2.indexOf(item) === -1) this.checkbox[item] = false;
				})
			}
		},
		activeWaitingReview() {
			return (window.location.pathname === '/e/auth') &&  window.location.search.includes('type=waiting-review')
		},
		search() {
			const {searchType, searchContent} = this;
			if(!searchContent) return sweetError('请输入搜索内容');
			if (this.btnType === 'waiting-review') {
				window.location.href = `/e/auth?c=${searchType},${searchContent}&type=waiting-review`;
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
