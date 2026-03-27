import './GrapeClusterBoard.css';

import { FILLED_GRAPE_IMAGE_MAP } from '../../constants/grapeCluster';

function FilledGrape({ fill, position }) {
  return (
    <div className="grape-board__grape-wrapper" style={{ left: position.left, top: position.top }}>
      <img className="grape-board__grape" src={FILLED_GRAPE_IMAGE_MAP[fill.variant]} alt="채워진 포도알" />
    </div>
  );
}

export function GrapeClusterBoard({
  backgroundImage,
  filledCount,
  maxCount,
  positions,
  fills,
  onFillToday,
  isFillBlocked,
  isGoalReady = true,
  inspectionMode = false,
}) {
  return (
    <section className="grape-board" aria-labelledby="grape-board-title">
      <div className="grape-board__status-row">
        <h2 id="grape-board-title" className="grape-board__title">
          포도송이
        </h2>
        <p className="grape-board__status">{filledCount} / {maxCount}</p>
      </div>

      <div className="grape-board__canvas">
        <img className="grape-board__background" src={backgroundImage} alt="이번 달 포도송이 배경판" />

        <div className="grape-board__overlay" aria-hidden="true">
          {fills.map((fill, index) => {
            const position = positions[index];

            if (!position) {
              return null;
            }

            return (
              <FilledGrape key={`${fill.date}-${fill.variant}`} fill={fill} position={position} />
            );
          })}
        </div>
      </div>

      <div className="grape-board__actions">
        <button className="grape-board__fill-button" type="button" onClick={onFillToday} disabled={isFillBlocked}>
          오늘 포도 채우기
        </button>
        <p className="grape-board__hint">
          {inspectionMode
            ? '위치 확인을 위해 이번 달 포도알을 모두 표시 중입니다.'
            : !isGoalReady
            ? '이번 달 목표를 저장한 뒤 포도알을 채울 수 있습니다.'
            : isFillBlocked
            ? '오늘은 이미 포도알을 채웠습니다.'
            : '하루에 한 번만 포도알을 채울 수 있습니다.'}
        </p>
      </div>
    </section>
  );
}