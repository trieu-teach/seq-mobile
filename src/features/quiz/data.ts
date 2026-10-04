import type { Quiz, QuizQuestion } from './types';

let sequence = 20;

export function createQuestion(): QuizQuestion {
  sequence += 1;
  return {
    id: `question-${sequence}`,
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
  };
}

export const starterQuizzes: Quiz[] = [
  {
    id: 'chi-tieu-thong-minh',
    title: 'Chi tiêu thông minh',
    description: 'Ôn lại cách phân biệt nhu cầu và mong muốn trong đời sống hằng ngày.',
    status: 'ready',
    updatedAt: '2026-10-02T08:30:00.000Z',
    questions: [
      {
        id: 'question-1',
        text: 'Khoản nào dưới đây là một nhu cầu thiết yếu?',
        options: ['Tiền ăn trưa', 'Vé xem phim', 'Móc khóa mới', 'Gói game'],
        correctOption: 0,
      },
      {
        id: 'question-2',
        text: 'Trước khi mua một món đồ ngoài kế hoạch, bạn nên làm gì?',
        options: ['Mua ngay', 'Vay bạn bè', 'Chờ 24 giờ và cân nhắc', 'Bỏ hết tiền tiết kiệm'],
        correctOption: 2,
      },
    ],
  },
  {
    id: 'ngan-sach-ca-nhan',
    title: 'Ngân sách cá nhân cơ bản',
    description: 'Bài kiểm tra nhanh sau chương Quản lý chi tiêu.',
    status: 'draft',
    updatedAt: '2026-09-29T03:10:00.000Z',
    questions: [
      {
        id: 'question-3',
        text: 'Ngân sách cá nhân giúp bạn điều gì?',
        options: ['Theo dõi thu chi', 'Mua mọi thứ mình thích', 'Không cần tiết kiệm', 'Tăng giá sản phẩm'],
        correctOption: 0,
      },
    ],
  },
];
