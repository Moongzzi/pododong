import './Header.css';

import { Link, NavLink } from 'react-router-dom';

import podoLogo from '../../../assets/images/logo/podo-logo.png';
import { AuthButton } from '../AuthButton/AuthButton';

export function Header({
  brandLabel,
  navItems,
  authState = 'loggedOut',
  authButtonTo,
  onAuthButtonClick,
}) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/" aria-label={brandLabel}>
          <img className="site-header__brand-image" src={podoLogo} alt="" />
        </Link>

        <nav className="site-header__nav" aria-label="주요 메뉴">
          <ul className="site-header__nav-list">
            {/* 메뉴 데이터만 바꾸면 헤더 링크를 같은 구조로 재사용할 수 있습니다. */}
            {navItems.map((item) => (
              <li key={item.id} className="site-header__nav-item">
                {item.to ? (
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'site-header__nav-link site-header__nav-link--active' : 'site-header__nav-link'
                    }
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <a className="site-header__nav-link" href={item.href}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__action">
          <AuthButton state={authState} to={authButtonTo} onClick={onAuthButtonClick} />
        </div>
      </div>
    </header>
  );
}