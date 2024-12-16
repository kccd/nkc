export async function copyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // 使 textarea 不可见
  textArea.style.position = 'fixed';
  textArea.style.top = '-100px';
  textArea.style.left = '-100px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  return new Promise((resolve, reject) => {
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        resolve();
      } else {
        reject();
      }
    } catch (err) {
      reject(err);
    }
    document.body.removeChild(textArea);
  });
}
