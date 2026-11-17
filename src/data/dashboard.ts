export type IndicatorKey = 'wealth' | 'saving' | 'happiness' | 'risk' | 'goal';

export const indicatorMeta: Record<IndicatorKey, { label: string; color: string }> = {
  wealth: { label: 'Tài sản', color: '#3E8BD7' },
  saving: { label: 'Tiết kiệm', color: '#2FA66F' },
  happiness: { label: 'Hạnh phúc', color: '#EF8D70' },
  risk: { label: 'Rủi ro', color: '#7456B8' },
  goal: { label: 'Mục tiêu', color: '#D09C00' },
};

// Nội dung chương là catalog tĩnh; backend chỉ cung cấp tiến độ và kết quả.
export const chapterCatalog = [
  { chapter: 1, title: 'Tiền đầu tiên', theme: 'Needs or Wants', image: require('../../assets/images/finteen/chapter-scope-01.png') },
  { chapter: 2, title: 'Tháng đầu tiên và mục tiêu lớn', theme: 'Budget Builder · Savings Race', image: require('../../assets/images/finteen/chapter-scope-02.png') },
  { chapter: 3, title: 'Công việc đầu tiên', theme: 'Career Match', image: require('../../assets/images/finteen/chapter-scope-03.png') },
  { chapter: 4, title: 'Mua thông minh', theme: 'Smart Shopping', image: require('../../assets/images/finteen/chapter-scope-04.png') },
  { chapter: 5, title: 'Ngân hàng và lãi', theme: 'Compound Timeline', image: require('../../assets/images/finteen/chapter-scope-05.png') },
  { chapter: 6, title: 'Mượn tiền có dễ không?', theme: 'Loan Detective', image: require('../../assets/images/finteen/chapter-scope-06.png') },
  { chapter: 7, title: 'Biến cố bất ngờ', theme: 'Scam or Safe', image: require('../../assets/images/finteen/chapter-scope-07.png') },
  { chapter: 8, title: 'Tiền sinh tiền và kế hoạch 18 tuổi', theme: 'Portfolio Builder · Life Planner', image: require('../../assets/images/finteen/chapter-scope-08.png') },
] as const;
