var swiper = new Swiper('.swiper-container', {
	pagination: {
		el: '.swiper-pagination',
		type: 'fraction',
	},
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	loop: true,
	autoplay: {
		delay: 3000,
		disableOnInteraction: false,
	},

});

function showChildrenForums(fid, color) {
	var childrenDiv = $('.f'+fid);
	/*$('li.list-group-item.home-forum-list-li').css({
		'border-left': '1px solid #eeeeee'
	});*/
	if(childrenDiv.css('display') === 'none') {
		childrenDiv.slideDown();
		/*$('li.list-group-item.home-forum-list-li').css({
			'border-left': 'none'
		});*/
		const childrenDivLi = $('.forumLi' + fid + ' li.list-group-item.home-forum-list-li');
		childrenDivLi.css({
			'border-left': '3px solid '+color
		});
	} else {
		childrenDiv.slideUp(function() {
			/*$('li.list-group-item.home-forum-list-li').css({
				'border-left': '1px solid #eeeeee'
			});*/
			$('.forumLi' + fid + ' li.list-group-item.home-forum-list-li').css({
				'border-left': '1px solid #eeeeee'
			});
		});
	}

	var span = $('.span'+fid);
	if(span.hasClass('fa-caret-right')) {
		span.removeClass('fa-caret-right');
		span.addClass('fa-caret-down');
	} else {
		span.removeClass('fa-caret-down');
		span.addClass('fa-caret-right');
	}
}

function showForumsDiv() {
	var div = $('#forumsDiv');
	div.slideToggle();
}
window.onresize = function() {
	displayRightDiv();
	if($(window).width() < 992) {// 删除悬浮div，显示原有div
		var fixedDiv = $('.fixedDiv');
		if(fixedDiv.length !== 0) {
			fixedDiv.remove();
			$('#forumsDiv').hide();
			$('#navDiv .row').show();
		}
	} else { // 隐藏原有div，生成悬浮div
		$('#navDiv .row').hide();
		$('#forumsDiv').show();
		createNavDiv();
		hiddenThreads();
	}
};
$(function() {
	hiddenThreads();
	if($(window).width() >= 992) {// 隐藏原有div
		$('#navDiv').find('.row').hide();
		createNavDiv();
	}
});

function loadThreads() {
	$('#loadThreads').hide();
	$('.hiddenThread').show();
	//$('#page').removeClass('hiddenInMobile');
}

function hiddenThreads() {
	if($(window).width() >= 992) {
		$('#loadThreads').hide();
		$('.hiddenThread').show();
		//$('#page').removeClass('hiddenInMobile');
	} else {
		$('#loadThreads').show();
		$('.hiddenThread').hide();
	}
}

function createNavDiv() {
	var navDiv = $('#navDiv');
	var fixedDiv = $('.fixedDiv');
	var html = navDiv.html();
	var padding = navDiv.css('padding-left');
	var width = navDiv.width();
	var offset = navDiv.offset();
	if(fixedDiv.length === 0) {
		fixedDiv = newElement('div', {class: 'fixedDiv'}, {
			'position': 'fixed',
			'overflow-y': 'auto',
			'overflow-x': 'hidden',
			'width': width + 'px',
			'top': offset.top + 'px',
			'bottom': '0px',
			'left': offset.left + parseFloat(padding) + 'px',
		}).html(html);
		fixedDiv.find('.row').show();
		$('body').append(fixedDiv);
	}
	fixedDiv.css({
		'position': 'fixed',
		'overflow-y': 'auto',
		'overflow-x': 'hidden',
		'width': width + 'px',
		'top': offset.top + 'px',
		'bottom': '0px',
		'left': offset.left + parseFloat(padding) + 'px',
	});
}

function createRightDiv() {


	var fixedThreadsListDiv = $('#fixedThreadsListDiv');

	var digestThreadsListDiv = $('#digestThreadsListDiv');
	var digestThreadsListDivPadding = digestThreadsListDiv.css('padding-left');
	var digestThreadsListDivWidth = digestThreadsListDiv.width();
	var digestThreadsListDivOffset = digestThreadsListDiv.offset();

	if(fixedThreadsListDiv.length === 0) {
		fixedThreadsListDiv = newElement('div', {id: 'fixedThreadsListDiv'}, {}).html(digestThreadsListDiv.html());
		$('body').append(fixedThreadsListDiv);
	}
	fixedThreadsListDiv.css({
		'position': 'fixed',
		'top': '65px',
		'width': digestThreadsListDivWidth + 'px',
		'left': digestThreadsListDivOffset.left + parseFloat(digestThreadsListDivPadding) + 'px'
	});

}

$(document).scroll(function() {
	displayRightDiv();
});

function displayRightDiv() {
	if($(window).width() < 992) {
		$('#fixedThreadsListDiv').remove();
	} else {
		var rightDiv = $('#rightDiv');
		var height = rightDiv.height();
		var top = rightDiv.offset().top;
		var scrollTop = $(document).scrollTop();
		if(height + top - scrollTop < 65) {
			createRightDiv()
		} else {
			$('#fixedThreadsListDiv').remove();
		}
	}
}