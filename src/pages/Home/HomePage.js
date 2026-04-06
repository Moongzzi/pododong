import './HomePage.css';

import { useEffect, useState } from 'react';

import { Header } from '../../components/common/Header/Header';
import { WinnerShowcase } from '../../components/common/WinnerShowcase/WinnerShowcase';
import { HEADER_BRAND_LABEL, HEADER_NAV_ITEMS } from '../../constants/header';
import { HOME_GREETING } from '../../constants/home';
import { ROUTES } from '../../constants/routes';
import { fetchMonthlyTop3 } from '../../lib/grapeApi';

const RANK_ACCENT_CLASS = {
  1: 'winner-showcase__avatar--sky',
  2: 'winner-showcase__avatar--rose',
  3: 'winner-showcase__avatar--mint',
};

export function HomePage({ authState = 'loggedOut', onLogout, isSupabaseReady = false }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(isSupabaseReady);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseReady) {
      setIsLoading(false);
      setMembers([]);
      return;
    }

    let isMounted = true;

    async function loadTopMembers() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await fetchMonthlyTop3();

        if (!isMounted) {
          return;
        }

        setMembers(
          result.map((member) => ({
            id: member.user_id,
            rank: Number(member.rank),
            name: member.display_name,
            profileImageUrl: member.profile_image_url ?? '',
            badgeLabel: `${member.rank}등`,
            accentClassName: RANK_ACCENT_CLASS[member.rank] || 'winner-showcase__avatar--sky',
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

    loadTopMembers();

    return () => {
      isMounted = false;
    };
  }, [isSupabaseReady]);

  return (
    <>
      <Header
        brandLabel={HEADER_BRAND_LABEL}
        navItems={HEADER_NAV_ITEMS}
        authState={authState}
        authButtonTo={authState === 'loggedIn' ? undefined : ROUTES.login}
        onAuthButtonClick={authState === 'loggedIn' ? onLogout : undefined}
      />

      <main className="home-page">
        <section className="home-greeting" aria-labelledby="home-greeting-title">
          <h1 id="home-greeting-title" className="home-greeting__title">
            <span>{HOME_GREETING.title[0]}</span>
            <span>{HOME_GREETING.title[1]}</span>
          </h1>

          {!isSupabaseReady ? (
            <p className="home-page__status">Supabase 설정 후 이번 달 베스트 회원을 불러올 수 있습니다.</p>
          ) : null}

          {isLoading ? <p className="home-page__status">이번 달 베스트 회원을 불러오는 중입니다.</p> : null}

          {errorMessage ? <p className="home-page__status home-page__status--error">{errorMessage}</p> : null}
        </section>

        <WinnerShowcase
          members={members}
          title={HOME_GREETING.sectionTitle}
          emptyMessage="이번 달 베스트 회원이 아직 정해지지 않았습니다. 첫 포도알을 채워 보세요."
        />
      </main>
    </>
  );
}