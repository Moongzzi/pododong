import './GrapeFieldPage.css';

import { useEffect, useState } from 'react';

import { Navigate } from 'react-router-dom';

import { Header } from '../../components/common/Header/Header';
import { VineyardMemberCard } from '../../components/vineyard/VineyardMemberCard';
import { HEADER_BRAND_LABEL, HEADER_NAV_ITEMS } from '../../constants/header';
import { ROUTES } from '../../constants/routes';
import { VINEYARD_PAGE_COPY } from '../../constants/vineyard';
import { fetchGrapeField } from '../../lib/grapeApi';

export function GrapeFieldPage({
  authState = 'loggedOut',
  onLogout,
  currentUser = null,
  currentProfile = null,
  isAuthenticated = false,
  isAuthLoading = false,
  isSupabaseReady = false,
}) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(isSupabaseReady && isAuthenticated);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseReady || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadMembers() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await fetchGrapeField();

        if (!isMounted) {
          return;
        }

        setMembers(
          result.map((member) => ({
            id: member.user_id,
            name: member.display_name,
            profileImageUrl: member.profile_image_url ?? '',
            grapeCount: Number(member.grape_count ?? 0),
            goalText: member.goal_text ?? '',
          }))
        );
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isSupabaseReady]);

  if (!isAuthLoading && !isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <>
      <Header
        brandLabel={HEADER_BRAND_LABEL}
        navItems={HEADER_NAV_ITEMS}
        authState={authState}
        authButtonTo={authState === 'loggedIn' ? undefined : ROUTES.login}
        onAuthButtonClick={authState === 'loggedIn' ? onLogout : undefined}
        currentUser={currentUser}
        currentProfile={currentProfile}
      />

      <main className="grape-field-page">
        <section className="grape-field-hero" aria-labelledby="grape-field-title">
          <p className="grape-field-hero__eyebrow">{VINEYARD_PAGE_COPY.eyebrow}</p>
          <h1 id="grape-field-title" className="grape-field-hero__title">
            {VINEYARD_PAGE_COPY.title}
          </h1>
          <p className="grape-field-hero__description">{VINEYARD_PAGE_COPY.description}</p>
        </section>

        <section className="grape-field-ranking" aria-labelledby="grape-field-ranking-title">
          <div className="grape-field-ranking__header">
            <h2 id="grape-field-ranking-title" className="grape-field-ranking__title">
              포도알 많은 순서
            </h2>
            <p className="grape-field-ranking__meta">총 {members.length}명의 멤버</p>
          </div>

          {isLoading ? <p className="grape-field-page__status">포도밭 현황을 불러오는 중입니다.</p> : null}
          {errorMessage ? <p className="grape-field-page__status grape-field-page__status--error">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && members.length === 0 ? (
            <p className="grape-field-page__status">아직 포도밭에 표시할 멤버 데이터가 없습니다.</p>
          ) : null}

          <ol className="grape-field-ranking__list">
            {members.map((member) => (
              <li key={member.id} className="grape-field-ranking__item">
                <VineyardMemberCard member={member} />
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}