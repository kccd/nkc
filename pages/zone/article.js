import {RNSetSharePanelStatus} from "../lib/js/reactNative";
import {getDataById} from "../lib/js/dataConversion";

const data = getDataById('data');
RNSetSharePanelStatus(true,'article',data.article.id)
