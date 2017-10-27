$(function () {
  $('#submit').on('click', function () {
    var inputFrom = $('input[name=from]').val();
    var inputTo = $('input[name=to]').val();
    var inputIp = $('input[name=ip]').val();
    if(inputFrom != '') {
      inputFrom = '&from=' + inputFrom;
    }
    if(inputTo != '') {
      inputTo = '&to=' + inputTo;
    }
    if(inputIp != '') {
      inputIp = '&ip=' + inputIp;
      inputFrom = '';
      inputTo = '';
    }
    window.location.href = '/behaviors?&page=1&type=all' + inputFrom + inputTo + inputIp;
  })
})