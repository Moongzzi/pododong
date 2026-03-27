import './AuthButton.css';

import { Link } from 'react-router-dom';
import { AUTH_BUTTON_ARIA_LABEL, AUTH_BUTTON_TEXT } from '../../../constants/header';

function LoginIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path
        d="M12 7.5H9.5C7.57 7.5 6 9.07 6 11v6c0 1.93 1.57 3.5 3.5 3.5H12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 14h11M18 8l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <path
        d="M16 7.5h2.5c1.93 0 3.5 1.57 3.5 3.5v6c0 1.93-1.57 3.5-3.5 3.5H16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 14H6M10 8l-6 6 6 6"
        transform="translate(7 0)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STATE_ICON = {
  loggedOut: LoginIcon,
  loggedIn: LogoutIcon,
};

export function AuthButton({ state = 'loggedOut', onClick, to, type = 'button' }) {
  // 아직 실제 인증 연동이 없으므로, 전달된 상태값만 기준으로 UI를 안전하게 그립니다.
  const safeState = STATE_ICON[state] ? state : 'loggedOut';
  const Icon = STATE_ICON[safeState];
  const content = (
    <>
      <span className="auth-button__icon-wrap">
        <span className="auth-button__icon-shadow" aria-hidden="true" />
        <span className="auth-button__icon">
          <Icon />
        </span>
      </span>
      <span className="auth-button__label">{AUTH_BUTTON_TEXT[safeState]}</span>
    </>
  );

  if (to) {
    return (
      <Link className="auth-button" to={to} aria-label={AUTH_BUTTON_ARIA_LABEL[safeState]}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className="auth-button"
      type={type}
      aria-label={AUTH_BUTTON_ARIA_LABEL[safeState]}
      onClick={onClick}
    >
      {content}
    </button>
  );
}