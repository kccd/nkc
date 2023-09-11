import { getState } from '../lib/js/state';
import { nkcAPI } from '../lib/js/netAPI';
import { visitUrl } from '../lib/js/pageSwitch';
import { sweetError } from '../lib/js/sweetAlert';

const state = getState();

$(function () {
  if (!state.uid) {
    $('.exam-link a')
      .removeAttr('href')
      .attr('onclick', "RootApp.openLoginPanel('login')")
      .addClass('pointer');
  }
});

window.createPaper = function (cid) {
  nkcAPI(`/exam/paper?cid=${cid}`, 'GET')
    .then((data) => {
      visitUrl(data.redirectUrl);
    })
    .catch(sweetError);
};
