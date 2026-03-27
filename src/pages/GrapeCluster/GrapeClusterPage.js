import './GrapeClusterPage.css';

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { GrapeClusterBoard } from '../../components/grape-cluster/GrapeClusterBoard';
import { MonthlyGoalForm } from '../../components/grape-cluster/MonthlyGoalForm';
import { Header } from '../../components/common/Header/Header';
import {
  GRAPE_CLUSTER_INSPECTION_MODE,
  GRAPE_POSITIONS,
  MONTH_BACKGROUND_MAP,
} from '../../constants/grapeCluster';
import { HEADER_BRAND_LABEL, HEADER_NAV_ITEMS } from '../../constants/header';
import { ROUTES } from '../../constants/routes';
import {
  addGrapeEntry,
  fetchMyGrapeCluster,
  fetchMonthlyGoal,
  getDateString,
  getMonthStart,
  saveMonthlyGoal,
} from '../../lib/grapeApi';

function getMonthLength(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function GrapeClusterPage({
  authState = 'loggedOut',
  onLogout,
  currentUser = null,
  isAuthenticated = false,
  isAuthLoading = false,
  isSupabaseReady = false,
}) {
  const today = new Date();
  const monthKey = getMonthStart(today);
  const todayKey = getDateString(today);
  const monthLength = getMonthLength(today);
  const [goalValue, setGoalValue] = useState('');
  const [isGoalLocked, setIsGoalLocked] = useState(false);
  const [fills, setFills] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(isSupabaseReady && isAuthenticated);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingFill, setIsSavingFill] = useState(false);

  const isGoalReady = isGoalLocked && goalValue.trim().length > 0;
  const hasFilledToday = fills.some((fill) => fill.date === todayKey);
  const displayFills = GRAPE_CLUSTER_INSPECTION_MODE ? [] : fills;
  const isFillBlocked = !isGoalReady || hasFilledToday || fills.length >= monthLength || isSavingFill;
  const backgroundImage = MONTH_BACKGROUND_MAP[monthLength];
  const positions = GRAPE_POSITIONS.slice(0, monthLength);

  useEffect(() => {
    if (!isSupabaseReady || !isAuthenticated) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;

    async function loadMyCluster() {
      setIsPageLoading(true);
      setErrorMessage('');
      setFeedbackMessage('');

      try {
        const result = await fetchMyGrapeCluster(monthKey);

        if (!isMounted) {
          return;
        }

        const nextGoalText = result?.goal?.goalText ?? '';
        const nextFills = Array.isArray(result?.fills)
          ? result.fills.map((fill) => ({
              date: fill.fillDate,
              variant: fill.variant,
            }))
          : [];

        setGoalValue(nextGoalText);
        setIsGoalLocked(Boolean(result?.goal?.isLocked && nextGoalText.trim()));
        setFills(nextFills);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    }

    loadMyCluster();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isSupabaseReady, monthKey]);

  function handleGoalChange(event) {
    setGoalValue(event.target.value);
  }

  async function handleGoalSubmit(event) {
    event.preventDefault();

    const trimmedGoal = goalValue.trim();

    if (!trimmedGoal || !currentUser?.id || isSavingGoal) {
      return;
    }

    setIsSavingGoal(true);
    setErrorMessage('');
    setFeedbackMessage('');

    try {
      await saveMonthlyGoal({
        userId: currentUser.id,
        goalText: trimmedGoal,
        targetMonth: monthKey,
      });

      setGoalValue(trimmedGoal);
      setIsGoalLocked(true);
      setFeedbackMessage('이번 달 목표를 저장했습니다.');
    } catch (error) {
      if (error.message === '이번 달 목표는 이미 저장되어 있습니다.') {
        try {
          const existingGoal = await fetchMonthlyGoal({
            userId: currentUser.id,
            targetMonth: monthKey,
          });

          if (existingGoal?.goal_text) {
            setGoalValue(existingGoal.goal_text);
            setIsGoalLocked(Boolean(existingGoal.is_locked));
          }
        } catch {
          // Keep the user-facing duplicate message below if the reload fails.
        }
      }

      setErrorMessage(error.message);
    } finally {
      setIsSavingGoal(false);
    }
  }

  async function handleFillToday() {
    if (isFillBlocked || !currentUser?.id) {
      return;
    }

    setIsSavingFill(true);
    setErrorMessage('');
    setFeedbackMessage('');

    try {
      const result = await addGrapeEntry({
        userId: currentUser.id,
        fillDate: todayKey,
      });

      setFills((currentFills) => [
        ...currentFills,
        {
          date: result.fill_date,
          variant: result.variant,
        },
      ]);
      setFeedbackMessage('오늘 포도알을 채웠습니다.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingFill(false);
    }
  }

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
      />

      <main className="grape-cluster-page">
        {isPageLoading ? <p className="grape-cluster-page__status">이번 달 포도송이를 불러오는 중입니다.</p> : null}
        {feedbackMessage ? <p className="grape-cluster-page__status grape-cluster-page__status--success">{feedbackMessage}</p> : null}
        {errorMessage ? <p className="grape-cluster-page__status grape-cluster-page__status--error">{errorMessage}</p> : null}
        {!isPageLoading && !errorMessage && !goalValue.trim() ? (
          <p className="grape-cluster-page__status">이번 달 목표를 저장하면 포도알을 하루에 한 번씩 채울 수 있습니다.</p>
        ) : null}
        {!isPageLoading && !errorMessage && isGoalReady && fills.length === 0 ? (
          <p className="grape-cluster-page__status">아직 채워진 포도알이 없습니다. 오늘의 첫 포도알을 채워 보세요.</p>
        ) : null}

        <MonthlyGoalForm
          goalValue={goalValue}
          isLocked={isGoalLocked}
          onChange={handleGoalChange}
          onSubmit={handleGoalSubmit}
        />

        <GrapeClusterBoard
          backgroundImage={backgroundImage}
          filledCount={displayFills.length}
          maxCount={monthLength}
          positions={positions}
          fills={displayFills}
          onFillToday={handleFillToday}
          isFillBlocked={isFillBlocked}
          isGoalReady={isGoalReady}
          inspectionMode={GRAPE_CLUSTER_INSPECTION_MODE}
        />
      </main>
    </>
  );
}