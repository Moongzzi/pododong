import './ProfileSettingsPage.css';

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Header } from '../../components/common/Header/Header';
import { HEADER_BRAND_LABEL, HEADER_NAV_ITEMS } from '../../constants/header';
import { ROUTES } from '../../constants/routes';
import { fetchCurrentUserProfile, updateCurrentUserProfile } from '../../lib/auth';

const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('이미지 파일을 읽지 못했습니다.'));
    };

    reader.onerror = () => {
      reject(new Error('이미지 파일을 읽지 못했습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

export function ProfileSettingsPage({
  authState = 'loggedOut',
  onLogout,
  currentUser = null,
  currentProfile = null,
  onProfileUpdated,
  isAuthenticated = false,
  isAuthLoading = false,
  isSupabaseReady = false,
}) {
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isLoading, setIsLoading] = useState(isSupabaseReady && isAuthenticated);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (!isSupabaseReady || !isAuthenticated || !currentUser?.id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const profile = currentProfile ?? (await fetchCurrentUserProfile(currentUser));

        if (!isMounted) {
          return;
        }

        setDisplayName(profile?.display_name ?? '');
        setProfileImageUrl(profile?.profile_image_url ?? '');
        setLoginName(profile?.login_name ?? '');
        setSelectedFileName('');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [currentProfile, currentUser, isAuthenticated, isSupabaseReady]);

  async function handleProfileImageChange(event) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith('image/')) {
      setErrorMessage('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    if (nextFile.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      setErrorMessage('프로필 이미지는 2MB 이하만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    setErrorMessage('');
    setFeedbackMessage('');

    try {
      const dataUrl = await readFileAsDataUrl(nextFile);

      setProfileImageUrl(dataUrl);
      setSelectedFileName(nextFile.name);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      event.target.value = '';
    }
  }

  function handleRemoveProfileImage() {
    setProfileImageUrl('');
    setSelectedFileName('');
    setFeedbackMessage('');
    setErrorMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!currentUser?.id || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setFeedbackMessage('');

    try {
      const savedProfile = await updateCurrentUserProfile({
        userId: currentUser.id,
        displayName,
        profileImageUrl,
      });

      onProfileUpdated?.(savedProfile);
      setDisplayName(savedProfile.display_name ?? '');
      setProfileImageUrl(savedProfile.profile_image_url ?? '');
      setLoginName(savedProfile.login_name ?? '');
      setFeedbackMessage('프로필을 저장했습니다.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
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
        currentUser={currentUser}
        currentProfile={currentProfile}
      />

      <main className="profile-settings-page">
        <section className="profile-settings-card" aria-labelledby="profile-settings-title">
          <p className="profile-settings-card__eyebrow">PROFILE SETTINGS</p>
          <h1 id="profile-settings-title" className="profile-settings-card__title">
            내 프로필 설정
          </h1>
          <p className="profile-settings-card__description">
            헤더 버튼과 포도밭 화면에서 표시될 이름과 프로필 이미지를 관리합니다.
          </p>

          {isLoading ? <p className="profile-settings-card__status">프로필 정보를 불러오는 중입니다.</p> : null}
          {feedbackMessage ? <p className="profile-settings-card__status profile-settings-card__status--success">{feedbackMessage}</p> : null}
          {errorMessage ? <p className="profile-settings-card__status profile-settings-card__status--error">{errorMessage}</p> : null}

          <form className="profile-settings-form" onSubmit={handleSubmit}>
            <div className="profile-settings-form__preview" aria-hidden="true">
              {profileImageUrl.trim() ? (
                <img className="profile-settings-form__preview-image" src={profileImageUrl.trim()} alt="" />
              ) : (
                <span className="profile-settings-form__preview-fallback">
                  {(displayName.trim() || loginName || 'P').slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <label className="profile-settings-form__field">
              <span className="profile-settings-form__label">아이디</span>
              <input className="profile-settings-form__input" type="text" value={loginName} readOnly />
            </label>

            <label className="profile-settings-form__field">
              <span className="profile-settings-form__label">표시 이름</span>
              <input
                className="profile-settings-form__input"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="표시 이름을 입력해 주세요"
                disabled={isLoading || isSaving}
              />
            </label>

            <label className="profile-settings-form__field">
              <span className="profile-settings-form__label">프로필 이미지</span>
              <label className="profile-settings-form__upload" htmlFor="profile-image-upload">
                <span className="profile-settings-form__upload-button">파일 선택</span>
                <span className="profile-settings-form__upload-text">
                  {selectedFileName || (profileImageUrl.trim() ? '현재 이미지가 설정되어 있습니다.' : '선택된 파일이 없습니다.')}
                </span>
              </label>
              <input
                id="profile-image-upload"
                className="profile-settings-form__file-input"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                disabled={isLoading || isSaving}
              />
              <p className="profile-settings-form__hint">PNG, JPG, GIF, WEBP 이미지 파일을 2MB 이하로 업로드할 수 있습니다.</p>
              {profileImageUrl.trim() ? (
                <button
                  className="profile-settings-form__remove-image"
                  type="button"
                  onClick={handleRemoveProfileImage}
                  disabled={isLoading || isSaving}
                >
                  이미지 제거
                </button>
              ) : null}
            </label>

            <button
              className="profile-settings-form__submit"
              type="submit"
              disabled={isLoading || isSaving || !displayName.trim()}
            >
              {isSaving ? '저장 중...' : '프로필 저장'}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}