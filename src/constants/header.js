import { ROUTES } from './routes';

export const HEADER_NAV_ITEMS = [
  { id: 'grape-cluster', label: '포도송이', to: ROUTES.grapeCluster },
  { id: 'vineyard', label: '포도밭', to: ROUTES.grapeField },
  { id: 'mailbox', label: '우체통', href: '#mailbox' },
];

export const AUTH_BUTTON_TEXT = {
  loggedOut: 'LOGIN',
  loggedIn: 'LOGOUT',
};

export const AUTH_BUTTON_ARIA_LABEL = {
  loggedOut: '로그인',
  loggedIn: '로그아웃',
};

export const HEADER_BRAND_LABEL = '포도동 홈';