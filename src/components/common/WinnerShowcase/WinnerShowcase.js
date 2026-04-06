import './WinnerShowcase.css';

function MemberAvatar({ member }) {
  const initials = member.name.slice(0, 1);
  const profileImageUrl = member.profileImageUrl?.trim();

  return (
    <div className={`winner-showcase__avatar ${member.accentClassName}`} aria-hidden="true">
      {profileImageUrl ? (
        <>
          <img className="winner-showcase__avatar-image" src={profileImageUrl} alt={`${member.name} 프로필 이미지`} />
          <span className="winner-showcase__avatar-ring" />
        </>
      ) : (
        <>
          <span className="winner-showcase__avatar-ring" />
          <span className="winner-showcase__avatar-core">{initials}</span>
        </>
      )}
    </div>
  );
}

function WinnerCard({ member }) {
  return (
    <article className="winner-showcase__card" aria-label={`${member.badgeLabel} ${member.name}`}>
      <div className="winner-showcase__badge" aria-hidden="true">
        {member.badgeLabel}
      </div>
      <MemberAvatar member={member} />
      <p className="winner-showcase__name">{member.name}</p>
    </article>
  );
}

export function WinnerShowcase({
  members,
  title,
  emptyMessage = '이번 달 첫 포도알을 채운 멤버가 아직 없습니다.',
}) {
  return (
    <section className="winner-showcase" aria-labelledby="winner-showcase-title">
      <h2 id="winner-showcase-title" className="winner-showcase__title">
        {title}
      </h2>

      <div className="winner-showcase__panel">
        {members.length > 0 ? (
          members.map((member) => <WinnerCard key={member.id} member={member} />)
        ) : (
          <p className="winner-showcase__empty">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}