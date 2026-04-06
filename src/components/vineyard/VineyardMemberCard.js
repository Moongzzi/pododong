import './VineyardMemberCard.css';

import {
  FILLED_GRAPE_IMAGE_MAP,
  FILLED_GRAPE_VARIANTS,
  getGrapePositions,
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

function MemberAvatar({ member }) {
  const profileImageUrl = member.profileImageUrl?.trim();
  const initials = member.name.slice(0, 1);

  return (
    <div className="vineyard-member-card__avatar">
      {profileImageUrl ? (
        <img className="vineyard-member-card__avatar-image" src={profileImageUrl} alt={`${member.name} 프로필 이미지`} />
      ) : (
        <span className="vineyard-member-card__avatar-fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  );
}

export function VineyardMemberCard({ member }) {
  const goalText = member.goalText?.trim() || '아직 이번 달 목표를 작성하지 않았어요.';
  const monthLength = getMonthLength(new Date());
  const maxCount = monthLength;
  const filledCount = Math.min(member.grapeCount, maxCount);
  const backgroundImage = MONTH_BACKGROUND_MAP[monthLength];
  const positions = getGrapePositions(maxCount);
  const fills = createPreviewFills(filledCount);

  return (
    <article className="vineyard-member-card" aria-labelledby={`vineyard-member-${member.id}`}>
      <div className="vineyard-member-card__header">
        <div className="vineyard-member-card__identity">
          <MemberAvatar member={member} />
          <div>
            <p className="vineyard-member-card__label">이번 달 포도송이</p>
            <h2 id={`vineyard-member-${member.id}`} className="vineyard-member-card__name">
              {member.name}
            </h2>
          </div>
        </div>
        <p className="vineyard-member-card__count" aria-label={`${member.name}의 포도알 개수 ${filledCount}개`}>
          {filledCount}개
        </p>
      </div>

      <div className="vineyard-member-card__goal-block">
        <p className="vineyard-member-card__goal-label">이번 달 목표</p>
        <p className="vineyard-member-card__goal">{goalText}</p>
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