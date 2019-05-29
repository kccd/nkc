/* 初始化图片裁剪工具
* @param {Function} callback 回调函数 callback(data), data为裁剪后的图片数据
* @param {Object} o 参数 详情https://github.com/fengyuanchen/cropperjs#options
* @author pengxiguaa 2019-5-5
* */

// 兼容代码，部分浏览器canvas对象没有toBlob方法
if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {

      var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

      for (var i=0; i<len; i++ ) {
        arr[i] = binStr.charCodeAt(i);
      }

      callback( new Blob( [arr], {type: type || 'image/png'} ) );
    }
  });
}


var moduleCrop = {};
moduleCrop.cropper = {};

moduleCrop.init = function(callback, o) {
  var options = {
    viewMode:0,
    aspectRatio: 1,
    checkCrossOrigin: false,
    movable: false,
    canSelectNewImage: true,
  };
  if(o) {
    for(var i in o) {
      options[i] = o[i];
    }
  }

  if(options.canSelectNewImage) {
    $(".crop-select-panel").css("display", "inline-block");
  } else {
    $(".crop-select-panel").css("display", "none");
  }

  var $image = $('#module_crop_image');

  $image.cropper(options);

  moduleCrop.cropper = $image.data('cropper');

  moduleCrop.complete = function() {
    screenTopAlert("图片处理中，请稍后...");
    try{
      moduleCrop.cropper.getCroppedCanvas().toBlob(function(blob) {
        callback(blob);
      });
    }
    catch(e)
    {
      console.log(e);
      if(options.errorInfo) {
        screenTopWarning(options.errorInfo)
      }
    }
    moduleCrop.cancel();
  };

  // 显示裁剪框
  moduleCrop.show = function() {
    $("#module_crop").show();
    stopBodyScroll(true);
  };
  // 隐藏裁剪框
  moduleCrop.hide = function() {
    $("#module_crop").hide();
    stopBodyScroll(false);
  };
  moduleCrop.selectFile = function() {
    $("#module_crop_input").click();
  };
  moduleCrop.selectedFile = function() {
    var files = $("#module_crop_input").prop('files');
    fileToUrl(files[0])
      .then(function(url) {
        moduleCrop.replace(url);
      })
  };

  // 显示需要裁剪的图片
  // @param {String} url 图片链接
  moduleCrop.replace = function(url) {
    moduleCrop.cropper.replace(url);
  };

  moduleCrop.cancel = function() {
    $("#module_crop_input").val("");
    moduleCrop.cropper.destroy();
    moduleCrop.hide();
  };
  moduleCrop.rotate = function(type) {
    if(type === "left") {
      moduleCrop.cropper.rotate(-90);
    } else {
      moduleCrop.cropper.rotate(90);
    }
    if(options.resetCrop) {
      // 获取图片位置信息
      var imageData = moduleCrop.cropper.getImageData();
      var height = imageData.height;
      var top = imageData.top;
      var left = imageData.left;
      var width = imageData.width;
      if(height < 0) height = 0;
      if(top < 0) top = 0;
      if(left < 0) left = 0;
      if(width < 0) width = 0;
      moduleCrop.cropper.setCropBoxData({
        height: height,
        width: width,
        top: top,
        left: left
      })
    }
  }
};
