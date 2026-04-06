import { render, screen } from '@testing-library/react';

import { WinnerShowcase } from './WinnerShowcase';

test('shows a profile image when a winner has one', () => {
  render(
    <WinnerShowcase
      title="이번 달 베스트 회원!"
      members={[
        {
          id: 'winner-1',
          rank: 1,
          name: '김포도',
          badgeLabel: '1등',
          accentClassName: 'winner-showcase__avatar--sky',
          profileImageUrl: 'https://example.com/winner.png',
        },
      ]}
    />
  );

  expect(screen.getByAltText('김포도 프로필 이미지')).toBeInTheDocument();
});

test('falls back to the winner initial when no profile image exists', () => {
  render(
    <WinnerShowcase
      title="이번 달 베스트 회원!"
      members={[
        {
          id: 'winner-2',
          rank: 2,
          name: '이청포도',
          badgeLabel: '2등',
          accentClassName: 'winner-showcase__avatar--rose',
          profileImageUrl: '',
        },
      ]}
    />
  );

  expect(screen.getByText('이')).toBeInTheDocument();
});