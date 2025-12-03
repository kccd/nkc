import { logger } from './logger';
export function renderFormula(elements) {
  if (!elements) {
    return;
  }
  if (!Array.isArray(elements)) {
    elements = [elements];
  }
  if (window.MathJax) {
    logger.debug(`公式准备中...`);
    window.MathJax.startup.promise.then(() => {
      logger.debug(`公式渲染中...`);
      window.MathJax.typesetPromise(elements ? elements : undefined);
      logger.debug(`公式渲染完成`);
    });
  }
}
