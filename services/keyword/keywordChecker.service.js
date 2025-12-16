const SettingModel = require('../../dataModels/SettingModel');
const Mint = require('mint-filter').default;
class KeywordCheckerService {
  #pureWordRegExp = /([^\u4e00-\u9fa5a-zA-Z0-9-_,.，。!！])/gi;

  // 根据敏感词组，匹配内容中的敏感词
  matchKeywordsByGroups = async (content, groups) => {
    const reviewSettings = await SettingModel.getSettings('review');
    const keywordSettings = reviewSettings.keyword;
    if (!keywordSettings) {
      return [];
    }
    if (!keywordSettings.enable) {
      return [];
    }
    content = content
      .replace(/\n/gi, '')
      .replace(this.#pureWordRegExp, '')
      .toLowerCase();
    let results = [];
    for (const group of groups) {
      let { keywords } = group;
      keywords = keywords.map((keyword) =>
        keyword
          .replace(/\n/gi, '')
          .replace(this.#pureWordRegExp, '')
          .toLowerCase(),
      );
      const {
        times: leastKeywordTimes,
        count: leastKeywordCount,
        logic: relationship,
      } = group.conditions;

      const mint = new Mint(keywords);
      const contentFilterValue = await mint.filter(content, { replace: false });
      // 保存结果
      const matchedKeywords = [...contentFilterValue.words];
      // 开始分析检测结果
      if (contentFilterValue.pass) {
        // 代表没有命中任何关键词
        continue;
      }

      // 命中敏感词个数
      const hitWordsCount = contentFilterValue.words.length;
      // 总命中次数
      let hitCount = 0;

      contentFilterValue.words.forEach((word) => {
        hitCount += (content.match(new RegExp(word, 'g')) || []).length;
      });
      if (relationship === 'or') {
        if (
          hitWordsCount >= leastKeywordCount ||
          hitCount >= leastKeywordTimes
        ) {
          results = results.concat(matchedKeywords);
        }
      } else if (relationship === 'and') {
        if (
          hitWordsCount >= leastKeywordCount &&
          hitCount >= leastKeywordTimes
        ) {
          results = results.concat(matchedKeywords);
        }
      }
    }

    return [...new Set(results)];
  };

  // 根据敏感词组ID，匹配内容中的敏感词
  matchKeywordsByGroupsId = async (content, groupsId) => {
    const reviewSettings = await SettingModel.getSettings('review');
    const keywordSettings = reviewSettings.keyword;
    if (!keywordSettings) {
      return [];
    }
    if (!keywordSettings.enable) {
      return [];
    }
    const { wordGroup } = keywordSettings;
    const groups = wordGroup.filter((group) => groupsId.includes(group.id));
    if (groups.length === 0) {
      return [];
    }
    return await this.matchKeywordsByGroups(content, groups);
  };
}

module.exports = {
  keywordCheckerService: new KeywordCheckerService(),
};
