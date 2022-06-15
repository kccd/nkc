
function GetContainer(container) {
  return container? $(container): $(document);
}

function GetArticlesPanelItem(container) {
  const containerJQ = GetContainer(container);
  return containerJQ
    .find('.articles-panel .articles-panel-item');
}

function GetCheckBoxInput(container) {
  const containerJQ = GetContainer(container);
  return containerJQ
    .find('.articles-panel .articles-panel-item .articles-panel-checkbox input');
}

/*
* @param {Element} container 父级元素, 默认为 document
* */
export function ShowArticlePanelCheckBox(container) {
  const item = GetArticlesPanelItem(container);
  item.attr('data-checkbox-show', 'true');
}

export function HideArticlePanelCheckBox(container) {
  const item = GetArticlesPanelItem(container);
  item.attr('data-checkbox-show', 'false');
}

export function SwitchArticlePanelCheckBoxDisplayStatus(container) {
  const item = GetArticlesPanelItem(container);
  const checkBoxStatus = item.attr('data-checkbox-show');
  if(checkBoxStatus === 'true') {
    HideArticlePanelCheckBox(container);
  } else {
    ShowArticlePanelCheckBox(container);
  }
}

export function SelectAllArticlePanelCheckBox(container) {
  const input = GetCheckBoxInput(container);
  input.prop('checked', true);
}

export function CancelSelectAllArticlePanelCheckBox(container) {
  const input = GetCheckBoxInput(container);
  input.prop('checked', false);
}

export function SwitchSelectArticlePanelCheckBox(container) {
  let selectAll = true;
  const input = GetCheckBoxInput(container);
  for(let i = 0; i < input.length; i++) {
    const _input = input.eq(i);
    if(!_input.prop('checked')) {
      selectAll = false;
      break;
    }
  }
  if(selectAll) {
    CancelSelectAllArticlePanelCheckBox(container);
  } else {
    SelectAllArticlePanelCheckBox(container);
  }
}

export function GetSelectedArticlesInfo(container) {
  const input = GetCheckBoxInput(container);
  const articlesInfo = [];
  for(let i = 0; i < input.length; i++) {
    const _input = input.eq(i);
    if(!_input.prop('checked')) continue;
    const item = _input.parents('.articles-panel-item');
    if(item.length === 0) continue;
    articlesInfo.push({
      type: item.attr('data-article-type'),
      id: item.attr('data-article-id')
    });
  }
  return articlesInfo;
}
