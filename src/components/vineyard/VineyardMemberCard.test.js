import { render, screen } from '@testing-library/react';

import { VineyardMemberCard } from './VineyardMemberCard';

test('shows the member monthly goal in the vineyard card', () => {
  render(
    <VineyardMemberCard
      member={{
        id: 'member-1',
        name: '김포도',
        grapeCount: 12,
        goalText: '주 3회 출석하기',
      }}
    />
  );

  expect(screen.getByText('이번 달 목표')).toBeInTheDocument();
  expect(screen.getByText('주 3회 출석하기')).toBeInTheDocument();
});

test('shows a fallback message when the member goal is empty', () => {
  render(
    <VineyardMemberCard
      member={{
        id: 'member-2',
        name: '이청포도',
        grapeCount: 7,
        goalText: '   ',
      }}
    />
  );

  expect(screen.getByText('아직 이번 달 목표를 작성하지 않았어요.')).toBeInTheDocument();
});

test('shows the member profile image when available', () => {
  render(
    <VineyardMemberCard
      member={{
        id: 'member-3',
        name: '박머루',
        grapeCount: 18,
        goalText: '물주기 담당하기',
        profileImageUrl: 'https://example.com/profile.png',
      }}
    />
  );

  expect(screen.getByAltText('박머루 프로필 이미지')).toBeInTheDocument();
});