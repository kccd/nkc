import {nkcAPI} from '../../lib/js/netAPI';
import {sweetError} from "../../lib/js/sweetAlert";
import {visitUrl} from "../../lib/js/pageSwitch";
import {getDataById} from "../../lib/js/dataConversion";
const {bookId} = getDataById('data');
function modifyInvitationStatus(agree){
  nkcAPI(`/book/${bookId}/member/invitation`, 'POST', {
    agree: !!agree
  })
    .then(() => {
      if(agree) {
        visitUrl('/creation/books')
      } else {
        window.location.reload();
      }
    })
    .catch(sweetError)
}

Object.assign(window, {
  modifyInvitationStatus,
});
