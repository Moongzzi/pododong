import './App.css';

import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { GrapeClusterPage } from './pages/GrapeCluster/GrapeClusterPage';
import { GrapeFieldPage } from './pages/GrapeField/GrapeFieldPage';
import { fetchCurrentUserProfile } from './lib/auth';
import { ROUTES } from './constants/routes';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { THEME_STYLE } from './constants/theme';
import { HomePage } from './pages/Home/HomePage';
import { LoginPage } from './pages/Login/LoginPage';
import { ProfileSettingsPage } from './pages/ProfileSettings/ProfileSettingsPage';

function App() {
  const [session, setSession] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function bootstrapSession() {
      const {
        data: { session: nextSession },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(nextSession);
        setIsAuthLoading(false);
      }
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user) {
      setCurrentProfile(null);
      return undefined;
    }

    let isMounted = true;

    async function loadCurrentProfile() {
      try {
        const profile = await fetchCurrentUserProfile(session.user);

        if (isMounted) {
          setCurrentProfile(profile);
        }
      } catch {
        if (isMounted) {
          setCurrentProfile(null);
        }
      }
    }

    loadCurrentProfile();

    return () => {
      isMounted = false;
    };
  }, [session]);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }

  const isAuthenticated = Boolean(session?.user);
  const authState = isAuthenticated ? 'loggedIn' : 'loggedOut';
  const sharedPageProps = {
    authState,
    isAuthenticated,
    isAuthLoading,
    isSupabaseReady: isSupabaseConfigured,
    onLogout: handleLogout,
    currentUser: session?.user ?? null,
    currentProfile,
    onProfileUpdated: setCurrentProfile,
  };

  return (
    <div className="app-shell" style={THEME_STYLE}>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage {...sharedPageProps} />} />
        <Route path={ROUTES.grapeCluster} element={<GrapeClusterPage {...sharedPageProps} />} />
        <Route path={ROUTES.grapeField} element={<GrapeFieldPage {...sharedPageProps} />} />
        <Route path={ROUTES.profileSettings} element={<ProfileSettingsPage {...sharedPageProps} />} />
        <Route path={ROUTES.login} element={<LoginPage {...sharedPageProps} />} />
      </Routes>
    </div>
  );
}

export default App;
