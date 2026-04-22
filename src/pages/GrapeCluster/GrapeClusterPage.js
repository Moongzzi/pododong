import './GrapeClusterPage.css';

import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { GrapeClusterBoard } from '../../components/grape-cluster/GrapeClusterBoard';
import { MonthlyGoalForm } from '../../components/grape-cluster/MonthlyGoalForm';
import { Header } from '../../components/common/Header/Header';
import {
  GRAPE_CLUSTER_INSPECTION_MODE,
  getGrapePositions,
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

function createMonthDate(year, month) {
  return new Date(year, month - 1, 1);
}

function getMonthOptionLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getAvailableMonthValues(year, currentYear, currentMonth) {
  const lastMonth = year === currentYear ? currentMonth : 12;

  return Array.from({ length: lastMonth }, (_, index) => index + 1);
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
  const todayKey = getDateString(today);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(todayYear);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [activeMonth, setActiveMonth] = useState(() => createMonthDate(todayYear, todayMonth));
  const [goalValue, setGoalValue] = useState('');
  const [isGoalLocked, setIsGoalLocked] = useState(false);
  const [fills, setFills] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(isSupabaseReady && isAuthenticated);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSavingFill, setIsSavingFill] = useState(false);

  const monthKey = getMonthStart(activeMonth);
  const monthLength = getMonthLength(activeMonth);
  const activeYear = activeMonth.getFullYear();
  const activeMonthNumber = activeMonth.getMonth() + 1;
  const activeMonthLabel = getMonthOptionLabel(activeMonth);
  const isCurrentMonth = activeYear === todayYear && activeMonthNumber === todayMonth;
  const isPastMonth = activeMonth.getTime() < createMonthDate(todayYear, todayMonth).getTime();
  const yearOptions = useMemo(() => {
    const startYear = 2024;
    const endYear = todayYear;

    return Array.from({ length: endYear - startYear + 1 }, (_, index) => endYear - index);
  }, [todayYear]);
  const monthOptions = useMemo(
    () =>
      getAvailableMonthValues(selectedYear, todayYear, todayMonth).map((month) => ({
        value: month,
        label: `${month}월`,
      })),
    [selectedYear, todayMonth, todayYear]
  );
  const isGoalEditable = isCurrentMonth && !isGoalLocked;

  const isGoalReady = isGoalLocked && goalValue.trim().length > 0;
  const hasFilledToday = fills.some((fill) => fill.date === todayKey);
  const displayFills = GRAPE_CLUSTER_INSPECTION_MODE ? [] : fills;
  const isFillBlocked =
    !isGoalReady ||
    !isCurrentMonth ||
    hasFilledToday ||
    fills.length >= monthLength ||
    isSavingFill;
  const backgroundImage = MONTH_BACKGROUND_MAP[monthLength];
  const positions = useMemo(() => getGrapePositions(monthLength), [monthLength]);

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

  function handleYearChange(event) {
    const nextYear = Number(event.target.value);
    const availableMonths = getAvailableMonthValues(nextYear, todayYear, todayMonth);
    const nextMonth = availableMonths.includes(selectedMonth)
      ? selectedMonth
      : availableMonths[availableMonths.length - 1];

    setSelectedYear(nextYear);
    setSelectedMonth(nextMonth);
  }

  function handleMonthChange(event) {
    setSelectedMonth(Number(event.target.value));
  }

  function handleSearchMonth() {
    setActiveMonth(createMonthDate(selectedYear, selectedMonth));
  }

  function handleResetToToday() {
    setSelectedYear(todayYear);
    setSelectedMonth(todayMonth);
    setActiveMonth(createMonthDate(todayYear, todayMonth));
  }

  async function handleGoalSubmit(event) {
    event.preventDefault();

    const trimmedGoal = goalValue.trim();

    if (!trimmedGoal || !currentUser?.id || isSavingGoal || !isCurrentMonth) {
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
        {isPageLoading ? <p className="grape-cluster-page__status">{activeMonthLabel} 포도송이를 불러오는 중입니다.</p> : null}
        {feedbackMessage ? <p className="grape-cluster-page__status grape-cluster-page__status--success">{feedbackMessage}</p> : null}
        {errorMessage ? <p className="grape-cluster-page__status grape-cluster-page__status--error">{errorMessage}</p> : null}
        {!isPageLoading && !errorMessage && !goalValue.trim() ? (
          <p className="grape-cluster-page__status">
            {isCurrentMonth
              ? '이번 달 목표를 저장하면 포도알을 하루에 한 번씩 채울 수 있습니다.'
              : isPastMonth
              ? `${activeMonthLabel} 목표와 포도 기록을 조회할 수 있습니다.`
              : `${activeMonthLabel} 데이터는 조회만 가능합니다.`}
          </p>
        ) : null}
        {!isPageLoading && !errorMessage && isGoalReady && fills.length === 0 ? (
          <p className="grape-cluster-page__status">
            {isCurrentMonth
              ? '아직 채워진 포도알이 없습니다. 오늘의 첫 포도알을 채워 보세요.'
              : `${activeMonthLabel}에는 아직 채워진 포도알이 없습니다.`}
          </p>
        ) : null}

        <MonthlyGoalForm
          monthLabel={activeMonthLabel}
          goalValue={goalValue}
          isLocked={isGoalLocked}
          isEditable={isGoalEditable}
          isSaving={isSavingGoal}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          yearOptions={yearOptions}
          monthOptions={monthOptions}
          onChange={handleGoalChange}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          onSearch={handleSearchMonth}
          onResetToToday={handleResetToToday}
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
          isCurrentMonth={isCurrentMonth}
          isGoalReady={isGoalReady}
          inspectionMode={GRAPE_CLUSTER_INSPECTION_MODE}
        />
      </main>
    </>
  );
}