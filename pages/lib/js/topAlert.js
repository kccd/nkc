let _alertcount = 0;
let _inited = false;

export function screenTopAlert(text) {
  screenTopAlertInit();
  return screenTopAlertOfStyle(text, 'success');
}

export function screenTopWarning(text) {
  screenTopAlertInit();
  text = text.error || text.message || text.toString();
  return screenTopAlertOfStyle(text, 'warning');
}

export function jalert(obj) {
  if (screenTopAlert) {
    return screenTopAlert(JSON.stringify(obj));
  } else {
    alert(JSON.stringify(obj));
  }
}

export function jwarning(obj) {
  if (screenTopWarning) {
    return screenTopWarning(JSON.stringify(obj));
  } else {
    alert(JSON.stringify(obj));
  }
}

function screenTopAlertOfStyle(text, stylestring) {
  //rely on bootstrap styles

  var objtext = $('<div/>').text(text).html();
  var itemID = getID();

  return new Promise(function (resolve, reject) {
    $('#alertOverlay').append(
      '<div class="alert alert-' +
        stylestring +
        '" id="' +
        itemID +
        '" role="alert" style="opacity:0.9;text-align:center;display:block; pointer-events:none; position:relative;margin:auto; top:0;max-width:500px; width:100%; margin-bottom:3px">' +
        objtext +
        '</div>',
    );

    var selector = '#' + itemID;

    setTimeout(function () {
      $(selector).fadeOut('slow', function () {
        $(selector).remove();
        resolve(selector);
      });
    }, 2000);
  });
}

function getID() {
  _alertcount++;
  return 'alert' + _alertcount.toString();
}

function screenTopAlertInit() {
  if (_inited) {
    return;
  }
  $('body').prepend(
    '<div id="alertOverlay" style="z-index:10001; display:block; position:fixed; top:0; width:100%;">' +
      '</div>',
  );
  _inited = true;
}
