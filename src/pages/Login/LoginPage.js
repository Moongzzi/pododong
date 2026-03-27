import './LoginPage.css';

import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import loginPageSymbol from '../../assets/icons/loginPageSymbol.png';
import { ROUTES } from '../../constants/routes';
import { loginWithNamePassword } from '../../lib/auth';

export function LoginPage({ isAuthenticated = false, isSupabaseReady = false }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isSupabaseReady || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const result = await loginWithNamePassword({
        loginName: username,
        password,
      });

      setStatusMessage(
        result.mode === 'signed-up-and-logged-in'
          ? '회원가입 후 로그인되었습니다.'
          : '로그인되었습니다.'
      );
    } catch (error) {
      setErrorMessage(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page" aria-labelledby="login-page-title">
      <section className="login-card" aria-label="로그인 폼">
        <div className="login-card__panel">
          <h1 id="login-page-title" className="login-card__title">
            LOGIN
          </h1>

          <form className="login-form" onSubmit={handleSubmit}>
            {!isSupabaseReady ? (
              <p className="login-form__helper" role="status">
                Supabase 환경변수를 먼저 설정하면 로그인 연동을 진행할 수 있습니다.
              </p>
            ) : null}

            {isSupabaseReady ? (
              <p className="login-form__helper" role="note">
                등록된 아이디가 없으면 회원가입 후 바로 로그인됩니다. 비밀번호는 6자 이상이어야 합니다.
              </p>
            ) : null}

            {errorMessage ? (
              <p className="login-form__feedback login-form__feedback--error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="login-form__feedback login-form__feedback--success" role="status">
                {statusMessage}
              </p>
            ) : null}

            <div className="login-form__field">
              <label className="login-form__label" htmlFor="username">
                USERNAME
              </label>
              <input
                className="login-form__input"
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={!isSupabaseReady || isSubmitting}
              />
            </div>

            <div className="login-form__field">
              <label className="login-form__label" htmlFor="password">
                PASSWORD
              </label>
              <input
                className="login-form__input"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                minLength={6}
                disabled={!isSupabaseReady || isSubmitting}
              />
            </div>

            <button
              className="login-form__submit"
              type="submit"
              disabled={!isSupabaseReady || isSubmitting || !username.trim() || password.trim().length < 6}
            >
              {isSubmitting ? 'PROCESSING...' : 'SIGN UP'}
            </button>
          </form>
        </div>

        <div className="login-card__symbol-area" aria-hidden="true">
          <img className="login-card__symbol" src={loginPageSymbol} alt="" />
        </div>
      </section>
    </main>
  );
}