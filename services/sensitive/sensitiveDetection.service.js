const { toolsService } = require('../settings/tools');
const { settingIds } = require('../../settings/serverSettings');
const { default: Mint } = require('mint-filter');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const { sensitiveTypes } = require('../../settings/sensitiveSetting');
const { sensitiveSettingService } = require('./sensitiveSetting.service');
const pureWordRegExp = /([^\u4e00-\u9fa5a-zA-Z0-9])/gi;

class SensitiveDetectionService {
  #relationShip = {
    or: 'or',
    and: 'and',
  };

  async #getContentSensitiveWordsByKeywordGroupIds(content, keywordGroupIds) {
    const keywordGroups = await this.#getKeywordGroupsByIds(keywordGroupIds);
    return await this.#getContentSensitiveWordsByKeywordGroups(
      content,
      keywordGroups,
    );
  }

  async isSensitiveContent(content, keywordGroupIds) {
    const words = await this.#getContentSensitiveWordsByKeywordGroupIds(
      content,
      keywordGroupIds,
    );
    return words.length > 0;
  }

  async #getKeywordGroupsByIds(groupIds) {
    const reviewSettings = await toolsService.getSettingContentById(
      settingIds.review,
    );
    const groups = [];
    for (const group of reviewSettings.keyword.wordGroup) {
      if (group && groupIds.includes(group.id)) {
        groups.push(group);
      }
    }
    return groups;
  }

  async #getContentSensitiveWordsByKeywordGroups(content, keywordGroups) {
    const reviewSettings = await toolsService.getSettingContentById(
      settingIds.review,
    );
    const keywordSettings = reviewSettings.keyword;
    if (!keywordSettings) {
      return [];
    }
    if (!keywordSettings.enable) {
      return [];
    }
    content = content.replace(pureWordRegExp, '').toLowerCase();
    let results = [];
    for (const group of keywordGroups) {
      let keywords = [...group.keywords];
      keywords = keywords.map((keyword) =>
        keyword.replace(pureWordRegExp, '').toLowerCase(),
      );
      const {
        times: leastKeywordTimes,
        count: leastKeywordCount,
        logic: relationship,
      } = group.conditions;
      const mint = new Mint(keywords);
      const contentFilterValue = await mint.filter(content, { replace: false });
      // 保存结果
      const matchedKeywords = [].concat(contentFilterValue.words);
      // 开始分析检测结果
      if (contentFilterValue.pass) {
        continue;
      } // 代表没有命中任何关键词
      // 命中敏感词个数
      const hitWordsCount = contentFilterValue.words.length;
      // 总命中次数
      let hitCount = 0;

      contentFilterValue.words.forEach((word) => {
        hitCount += (content.match(new RegExp(word, 'g')) || []).length;
      });
      if (relationship === this.#relationShip.or) {
        if (
          hitWordsCount >= leastKeywordCount ||
          hitCount >= leastKeywordTimes
        ) {
          results = results.concat(matchedKeywords);
        }
      } else if (relationship === this.#relationShip.and) {
        if (
          hitWordsCount >= leastKeywordCount &&
          hitCount >= leastKeywordTimes
        ) {
          results = results.concat(matchedKeywords);
        }
      }
    }
    return [...new Set(results)];
  }

  async #contentDetection(iid, content) {
    const { enabled, desc, groupIds } =
      await sensitiveSettingService.getSettingByIdFromCache(iid);
    if (enabled && groupIds.length > 0) {
      const isSensitiveContent = await this.isSensitiveContent(
        content,
        groupIds,
      );
      if (isSensitiveContent) {
        ThrowBadRequestResponseTypeError(
          ResponseTypes.IS_SENSITIVE_CONTENT,
          desc,
        );
      }
    }
  }

  async isSensitiveContentByType(type, content) {
    const { enabled, groupIds } =
      await sensitiveSettingService.getSettingByIdFromCache(type);
    let isSensitiveContent = false;
    if (enabled && groupIds.length > 0) {
      isSensitiveContent = await this.isSensitiveContent(content, groupIds);
    }
    return isSensitiveContent;
  }

  async usernameDetection(content) {
    await this.#contentDetection(sensitiveTypes.username, content);
  }

  async userDescDetection(content) {
    await this.#contentDetection(sensitiveTypes.userDesc, content);
  }

  async columnNameDetection(content) {
    await this.#contentDetection(sensitiveTypes.columnName, content);
  }

  async columnAbbrDetection(content) {
    await this.#contentDetection(sensitiveTypes.columnAbbr, content);
  }

  async threadNoticeDetection(content) {
    await this.#contentDetection(sensitiveTypes.threadNotice, content);
  }
}

module.exports = {
  sensitiveDetectionService: new SensitiveDetectionService(),
};
