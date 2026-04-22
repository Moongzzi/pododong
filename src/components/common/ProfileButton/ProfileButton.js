import './ProfileButton.css';

import { Link } from 'react-router-dom';

import { ROUTES } from '../../../constants/routes';

function getProfileDisplayName(user, profile) {
  return (
    profile?.display_name ??
    user?.user_metadata?.display_name ??
    user?.user_metadata?.login_name ??
    user?.raw_user_meta_data?.display_name ??
    user?.raw_user_meta_data?.login_name ??
    user?.email ??
    '내 프로필'
  );
}

function getProfileImageUrl(user, profile) {
  const profileImageFromProfile = typeof profile?.profile_image_url === 'string' ? profile.profile_image_url.trim() : '';

  if (profileImageFromProfile) {
    return profileImageFromProfile;
  }

  const nextImageUrl =
    user?.user_metadata?.profile_image_url ??
    user?.user_metadata?.avatar_url ??
    user?.raw_user_meta_data?.profile_image_url ??
    user?.raw_user_meta_data?.avatar_url ??
    '';

  return typeof nextImageUrl === 'string' ? nextImageUrl.trim() : '';
}

export function ProfileButton({ user = null, profile = null }) {
  const displayName = getProfileDisplayName(user, profile).trim() || '내 프로필';
  const profileImageUrl = getProfileImageUrl(user, profile);
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <Link
      className="profile-button"
      to={ROUTES.profileSettings}
      aria-label={`${displayName} 프로필`}
      title={displayName}
    >
      {profileImageUrl ? (
        <img className="profile-button__image" src={profileImageUrl} alt="" />
      ) : (
        <span className="profile-button__fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </Link>
  );
}