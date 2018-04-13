var mouseX = 0, mouseY = 0;
var maskTop = 0, maskLeft = 0;
var maskHeight = 0, maskWidth = 0;
var boxTop = 0, boxLeft = 0;
var boxWidth = 100, boxHeight = 100;

var mouseDown = false;

var canMove = false;
var canChangeSize = false;

var mouseBegin = 0, mouseEnd = 0;

$('#selectBox').on({
	'mousedown': function() {
		canMove = true;
	},
	'mouseup': function() {
		canMove = false;
		canChangeSize = false;
	}
});

$('#inputFile').on('change', function() {
	var file = $('#inputFile')[0].files[0];
	var reader = new FileReader();
	reader.onload = function() {
		var url = reader.result;
		displayAvatar(url);
	};
	reader.readAsDataURL(file)
});
$('html').on({
	'mousemove': function (e) {
		if (canMove && !canChangeSize) {
			displayBox(e);
		}
		if (canChangeSize) {
			var selectBox = $('#selectBox');
			var boxPosition = selectBox.offset();
			getMousePosition();
			var movePosition = mouseY - boxPosition.top;
			if ((movePosition + boxTop) > (maskHeight + maskTop)) {
				movePosition = maskHeight + maskTop - boxTop;
			}
			if ((movePosition + boxLeft) > (maskWidth + maskLeft)) {
				movePosition = maskWidth + maskleft - boxleft;
			}
			selectBox.height(movePosition + 'px');
			selectBox.width(movePosition + 'px');

			initBoxSize();
		}
	},
	'mouseup': function() {
		canMove = false;
		canChangeSize = false;
	}
});

$('#changeBtn3').on({
	'mousedown': function() {
		canMove = false;
		canChangeSize = true;
		getMousePosition();
		mouseBegin = mouseX;
		mouseEnd = mouseY;
		console.log('down');
	},
	'mouseup': function() {
		canMove = false;
		canChangeSize = false;
		console.log('up');
	}
});

function displayBox(e) {
	getMousePosition(e);
	getBoxPosition();
	initSize();
	moveSelectBox();
}
function getMousePosition(e) {
	e = e || window.event;
	mouseX = e.pageX || e.clientX + document.body.scroolLeft;
	mouseY = e.pageY || e.clientY + document.body.scrollTop;
}

function getBoxPosition() {
	boxTop = mouseY-0.5*boxHeight;
	boxLeft = mouseX-0.5*boxWidth;
}


function moveSelectBox() {
	var selectBox = $('#selectBox');
	if(maskTop > boxTop) {
		boxTop = maskTop;
	}
	if(maskTop + maskHeight < boxTop + boxHeight) {
		boxTop = maskTop + maskHeight - boxHeight;
	}
	if(maskLeft > boxLeft) {
		boxLeft = maskLeft;
	}
	if(maskLeft + maskWidth < boxLeft + boxWidth) {
		boxLeft = maskLeft + maskWidth - boxWidth;
	}
	selectBox.offset({top: boxTop, left: boxLeft});
	selectBox.css({
		'background-position': '-'+(boxLeft-maskLeft+1)+'px -'+(boxTop-maskTop+1)+'px'
	})
}

function displayAvatar(url) {
	$('.user-settings-img').attr('src', url);
	$('#selectBox').css('background-image', 'url('+url+')');
}

function initSize() {
	var imgDiv = $('.user-settings-img-mask');
	maskHeight = imgDiv.height();
	maskWidth = imgDiv.width();
	var maskPosition = imgDiv.offset();
	maskTop = maskPosition.top;
	maskLeft = maskPosition.left;
	$('#selectBox').css({
		'background-size': maskWidth+'px '+maskHeight+'px'
	})
}

function initBoxSize() {
	var selectBox = $('#selectBox');
	boxHeight = selectBox.height();
	boxWidth = selectBox.width();
	boxTop = selectBox.offset().top;
	boxLeft = selectBox.offset().left;
}

initSize();