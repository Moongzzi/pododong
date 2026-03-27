export const COLOR_TOKENS = {
  primary: '#6D3F9C',
  primaryDark: '#563173',
  button: '#CBBBE2',
  success: '#4A8F4E',
  background: '#F4F4F4',
  accent: '#C56BAC',
  surfaceBorder: '#E3DED7',
  text: '#4F3B68',
  white: '#FFFFFF',
};

// JS 상수를 CSS 변수로 바꿔 두면 컴포넌트와 스타일 파일이 같은 토큰을 공유할 수 있습니다.
export const THEME_STYLE = Object.entries(COLOR_TOKENS).reduce(
  (style, [tokenName, tokenValue]) => ({
    ...style,
    [`--color-${tokenName.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`]: tokenValue,
  }),
  {}
);