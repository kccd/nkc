import {RNSetSharePanelStatus} from "../lib/js/reactNative";
import {getDataById} from "../lib/js/dataConversion";

const data = getDataById('data');
const _document = data.article.document;
const momentInfo = {title:_document.title,content:_document.content}
RNSetSharePanelStatus(true,'article',data.article.id,JSON.stringify(momentInfo))
