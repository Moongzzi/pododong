import './VineyardMemberCard.css';

import {
  FILLED_GRAPE_IMAGE_MAP,
  FILLED_GRAPE_VARIANTS,
  GRAPE_POSITIONS,
  MONTH_BACKGROUND_MAP,
} from '../../constants/grapeCluster';

function getMonthLength(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function createPreviewFills(grapeCount) {
  return Array.from({ length: grapeCount }, (_, index) => ({
    id: `preview-${index + 1}`,
    variant: FILLED_GRAPE_VARIANTS[index % FILLED_GRAPE_VARIANTS.length],
  }));
}

export function VineyardMemberCard({ member }) {
  const monthLength = getMonthLength(new Date());
  const maxCount = monthLength;
  const filledCount = Math.min(member.grapeCount, maxCount);
  const backgroundImage = MONTH_BACKGROUND_MAP[monthLength];
  const positions = GRAPE_POSITIONS.slice(0, maxCount);
  const fills = createPreviewFills(filledCount);

  return (
    <article className="vineyard-member-card" aria-labelledby={`vineyard-member-${member.id}`}>
      <div className="vineyard-member-card__header">
        <div>
          <p className="vineyard-member-card__label">이번 달 포도송이</p>
          <h2 id={`vineyard-member-${member.id}`} className="vineyard-member-card__name">
            {member.name}
          </h2>
        </div>
        <p className="vineyard-member-card__count" aria-label={`${member.name}의 포도알 개수 ${filledCount}개`}>
          {filledCount}개
        </p>
      </div>

      <div className="vineyard-member-card__board" aria-hidden="true">
        <img className="vineyard-member-card__background" src={backgroundImage} alt="" />

        <div className="vineyard-member-card__overlay">
          {/* 앞에서부터 채워진 포도알 수만큼 미리보기를 그려 정렬 기준과 화면 표시가 일치하게 둡니다. */}
          {fills.map((fill, index) => {
            const position = positions[index];

            if (!position) {
              return null;
            }

            return (
              <span
                key={fill.id}
                className="vineyard-member-card__grape"
                style={{ left: position.left, top: position.top }}
              >
                <img src={FILLED_GRAPE_IMAGE_MAP[fill.variant]} alt="" />
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}