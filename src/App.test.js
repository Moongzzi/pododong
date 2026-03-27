import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the pododong header navigation and auth link on home', () => {
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '포도송이' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '포도동에 오신 걸 환영합니다!' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '이번 달 베스트 회원!' })).toBeInTheDocument();
});

test('moves to the login page when the header auth link is clicked', async () => {
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('link', { name: '로그인' }));

  expect(screen.getByRole('heading', { name: 'LOGIN' })).toBeInTheDocument();
  expect(screen.getByLabelText('USERNAME')).toBeInTheDocument();
});

test('moves to the grape cluster page from the header menu', () => {
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('link', { name: '포도송이' }));

  expect(screen.getByRole('textbox', { name: '이번 달 목표' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '오늘 포도 채우기' })).toBeDisabled();
});

test('moves to the grape field page from the header menu and shows members sorted by grape count', () => {
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('link', { name: '포도밭' }));

  expect(screen.getByRole('heading', { name: '이번 달 포도밭 현황' })).toBeInTheDocument();

  const memberHeadings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);

  expect(memberHeadings).toEqual([
    '포도알 많은 순서',
    '박머루',
    '김포도',
    '정캠벨',
    '이청포도',
    '최샤인',
    '한거봉',
  ]);
});

test('locks the monthly goal after saving', () => {
  render(
    <MemoryRouter
      initialEntries={['/grape-cluster']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  const goalInput = screen.getByRole('textbox', { name: '이번 달 목표' });

  userEvent.type(goalInput, '매일 포도 하나씩 채우기');
  userEvent.click(screen.getByRole('button', { name: '저장' }));

  expect(screen.queryByRole('button', { name: '저장' })).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('매일 포도 하나씩 채우기')).toHaveAttribute('readonly');
});

test('fills one grape only once per day', () => {
  render(
    <MemoryRouter
      initialEntries={['/grape-cluster']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  const goalInput = screen.getByRole('textbox', { name: '이번 달 목표' });
  const fillButton = screen.getByRole('button', { name: '오늘 포도 채우기' });

  expect(screen.queryAllByAltText('채워진 포도알')).toHaveLength(0);
  expect(fillButton).toBeDisabled();
  expect(screen.getByText('이번 달 목표를 저장한 뒤 포도알을 채울 수 있습니다.')).toBeInTheDocument();

  userEvent.type(goalInput, '매일 포도 하나씩 채우기');
  userEvent.click(screen.getByRole('button', { name: '저장' }));

  userEvent.click(fillButton);

  expect(screen.getAllByAltText('채워진 포도알')).toHaveLength(1);
  expect(fillButton).toBeDisabled();
  expect(screen.getByText('오늘은 이미 포도알을 채웠습니다.')).toBeInTheDocument();
});
