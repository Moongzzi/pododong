import './MonthlyGoalForm.css';

export function MonthlyGoalForm({
  monthLabel,
  goalValue,
  isLocked,
  isEditable = true,
  isSaving = false,
  selectedYear,
  selectedMonth,
  yearOptions,
  monthOptions,
  onChange,
  onYearChange,
  onMonthChange,
  onSearch,
  onResetToToday,
  onSubmit,
}) {
  return (
    <section className="monthly-goal" aria-labelledby="monthly-goal-title">
      <form className="monthly-goal__form" onSubmit={onSubmit}>
        <div className="monthly-goal__toolbar" aria-label="조회 월 선택">
          <select className="monthly-goal__select" value={selectedYear} onChange={onYearChange}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <select className="monthly-goal__select" value={selectedMonth} onChange={onMonthChange}>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <button className="monthly-goal__toolbar-button" type="button" onClick={onSearch}>
            조회
          </button>
          <button className="monthly-goal__toolbar-button monthly-goal__toolbar-button--secondary" type="button" onClick={onResetToToday}>
            오늘
          </button>
        </div>
        <label className="monthly-goal__label" id="monthly-goal-title" htmlFor="monthly-goal-input">
          {monthLabel} 목표
        </label>
        <input
          id="monthly-goal-input"
          className="monthly-goal__input"
          type="text"
          value={goalValue}
          onChange={onChange}
          placeholder={`${monthLabel} 목표를 입력해 주세요`}
          readOnly={!isEditable}
          aria-describedby="monthly-goal-help"
        />
        <p id="monthly-goal-help" className="monthly-goal__help">
          {isLocked
            ? '목표를 저장하면 해당 월에는 다시 수정할 수 없습니다.'
            : isEditable
            ? '이번 달 목표만 저장할 수 있습니다.'
            : '과거 월 목표는 조회만 가능합니다.'}
        </p>

        {!isLocked && isEditable ? (
          <button className="monthly-goal__submit" type="submit" disabled={!goalValue.trim() || isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </button>
        ) : null}
      </form>
    </section>
  );
}