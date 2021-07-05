import $ from "jquery";
import { unescape } from "html-escaper";

const dataText = unescape($("#__VUE_DATA").text());
export default JSON.parse(dataText);