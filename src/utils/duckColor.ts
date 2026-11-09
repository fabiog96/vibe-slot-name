const BANDANAS = [
  '#FF5A5F',
  '#7B61FF',
  '#00B894',
  '#FF9F1C',
  '#2EC4F1',
  '#F72585',
  '#8D6E63',
  '#06D6A0',
  '#9B5DE5',
  '#F15BB5',
  '#FEE440',
];

export const duckColor = (index: number) => BANDANAS[index % BANDANAS.length];
