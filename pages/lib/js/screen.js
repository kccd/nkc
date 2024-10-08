export function getScreenSizeModel() {
  const width = window.innerWidth;

  if (width < 768) {
    return 'xs'; // 手机
  } else if (width >= 768 && width < 992) {
    return 'sm'; // 平板
  } else if (width >= 992 && width < 1200) {
    return 'md'; // 桌面
  } else {
    return 'lg'; // 大桌面
  }
}
