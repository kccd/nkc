import { base64ToStr } from './dataConversion';

export function replaceNKCUrl(selector) {
  //解析文本中的外链
  selector = selector || 'span[data-type="nkc-url"]';
  var elements = document.querySelectorAll(selector);
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var url = element.getAttribute('data-url') || '';
    if (!url) {
      continue;
    }
    url = base64ToStr(url);
    element.innerText = url;
    element.removeAttribute('data-type');
    element.removeAttribute('data-url');
  }
}
