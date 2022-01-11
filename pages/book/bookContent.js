import {getDataById} from "../lib/js/dataConversion";
const {note} = getDataById('data');
$(function () {
  NKC.oneAfter("mathJaxRendered", function(_data, next) {
    const elements = document.querySelectorAll(`[data-type="nkc-render-content"]`);
    for(let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const source = element.getAttribute('data-source');
      const sid = element.getAttribute('data-sid');
      let notes = [];
      if(source === note.type && sid === note.targetId.toString()) {
        notes = note.notes
      }
      new NKC.modules.NKCHL({
        type: source,
        targetId: sid,
        notes,
        rootElement: element
      })
    }
  })
});