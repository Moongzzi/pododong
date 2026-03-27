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

// 배경판의 흰 원 중심점을 기준으로 포도알 이미지를 같은 순서로 쌓습니다.
export const GRAPE_POSITIONS = [
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