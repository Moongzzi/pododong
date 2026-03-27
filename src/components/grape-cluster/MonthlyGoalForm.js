import './MonthlyGoalForm.css';

export function MonthlyGoalForm({
  goalValue,
  isLocked,
  onChange,
  onSubmit,
}) {
  return (
    <section className="monthly-goal" aria-labelledby="monthly-goal-title">
      <form className="monthly-goal__form" onSubmit={onSubmit}>
        <label className="monthly-goal__label" id="monthly-goal-title" htmlFor="monthly-goal-input">
          이번 달 목표
        </label>
        <input
          id="monthly-goal-input"
          className="monthly-goal__input"
          type="text"
          value={goalValue}
          onChange={onChange}
          placeholder="이번 달 목표를 입력해 주세요"
          readOnly={isLocked}
          aria-describedby="monthly-goal-help"
        />
        <p id="monthly-goal-help" className="monthly-goal__help">
          목표를 저장하면 이번 달에는 다시 수정할 수 없습니다.
        </p>

        {!isLocked ? (
          <button className="monthly-goal__submit" type="submit" disabled={!goalValue.trim()}>
            저장
          </button>
        ) : null}
      </form>
    </section>
  );
}