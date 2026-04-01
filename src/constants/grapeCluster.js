import podoBackground28 from '../assets/images/podoBackground28.png';
import podoBackground29 from '../assets/images/podoBackground29.png';
import podoBackground30 from '../assets/images/podoBackground30.png';
import podoBackground31 from '../assets/images/podoBackground31.png';
import podo1 from '../assets/images/podo1.png';
import podo2 from '../assets/images/podo2.png';
import podo3 from '../assets/images/podo3.png';

export const GRAPE_CLUSTER_STORAGE_PREFIX = 'pododong:grape-cluster';

export const MONTH_BACKGROUND_MAP = {
  28: podoBackground28,
  29: podoBackground29,
  30: podoBackground30,
  31: podoBackground31,
};

export const FILLED_GRAPE_IMAGE_MAP = {
  podo1,
  podo2,
  podo3,
};

export const FILLED_GRAPE_VARIANTS = Object.keys(FILLED_GRAPE_IMAGE_MAP);

export const GRAPE_CLUSTER_INSPECTION_MODE = false;

export const GRAPE_POSITIONS_30 = [
  { left: '32.56%', top: '15.57%' },
  { left: '41.95%', top: '19.06%' },
  { left: '54.70%', top: '23.32%' },
  { left: '20.93%', top: '30.80%' },
  { left: '29.30%', top: '27.84%' },
  { left: '38.60%', top: '28.22%' },
  { left: '47.53%', top: '27.71%' },
  { left: '62.79%', top: '30.42%' },
  { left: '26.23%', top: '41.13%' },
  { left: '34.98%', top: '38.55%' },
  { left: '53.86%', top: '36.74%' },
  { left: '74.33%', top: '34.03%' },
  { left: '67.91%', top: '40.10%' },
  { left: '60.47%', top: '45.65%' },
  { left: '44.56%', top: '41.13%' },
  { left: '22.42%', top: '54.04%' },
  { left: '30.51%', top: '52.62%' },
  { left: '37.58%', top: '47.97%' },
  { left: '24.84%', top: '64.62%' },
  { left: '33.30%', top: '62.30%' },
  { left: '41.21%', top: '57.78%' },
  { left: '49.02%', top: '49.78%' },
  { left: '48.74%', top: '63.07%' },
  { left: '55.91%', top: '54.04%' },
  { left: '61.67%', top: '61.39%' },
  { left: '67.35%', top: '55.07%' },
  { left: '74.70%', top: '58.68%' },
  { left: '74.60%', top: '49.00%' },
  { left: '83.07%', top: '51.84%' },
  { left: '82.98%', top: '61.39%' },
];

// 배경판의 흰 원 중심점을 기준으로 포도알 이미지를 같은 순서로 쌓습니다.
export const GRAPE_POSITIONS_31 = [
  { left: '32.73%', top: '14.34%' },
  { left: '42.03%', top: '18.05%' },
  { left: '54.71%', top: '22.44%' },
  { left: '20.97%', top: '30.14%' },
  { left: '29.24%', top: '27.16%' },
  { left: '38.9%', top: '26.99%' },
  { left: '62.85%', top: '30.03%' },
  { left: '74.48%', top: '33.57%' },
  { left: '16.63%', top: '42.96%' },
  { left: '47.38%', top: '26.82%' },
  { left: '53.9%', top: '36.1%' },
  { left: '67.5%', top: '39.81%' },
  { left: '74.83%', top: '49.09%' },
  { left: '26.22%', top: '41.5%' },
  { left: '34.94%', top: '38.46%' },
  { left: '44.36%', top: '40.66%' },
  { left: '60.41%', top: '45.89%' },
  { left: '83.06%', top: '52.07%' },
  { left: '22.36%', top: '54.43%' },
  { left: '30.58%', top: '52.97%' },
  { left: '37.56%', top: '48.36%' },
  { left: '49.11%', top: '49.93%' },
  { left: '56.01%', top: '54.77%' },
  { left: '24.84%', top: '65.68%' },
  { left: '33.29%', top: '63.09%' },
  { left: '41.2%', top: '58.48%' },
  { left: '48.88%', top: '63.99%' },
  { left: '61.74%', top: '61.97%' },
  { left: '67.48%', top: '55.56%' },
  { left: '74.84%', top: '59.49%' },
  { left: '82.98%', top: '61.97%' },
];

export function getGrapePositions(monthLength) {
  if (monthLength === 30) {
    return GRAPE_POSITIONS_30;
  }

  return GRAPE_POSITIONS_31.slice(0, monthLength);
}