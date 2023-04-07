export function openMessageCenter() {
  const width = localStorage.getItem('windowWidth');
  const height = localStorage.getItem('windowHeight');
  window.open(
    '/message',
    'Message',
    `location=no,width=${width},height=${height}`,
  );
}
