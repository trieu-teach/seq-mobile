export type IndicatorKey = "wealth" | "saving" | "happiness" | "risk" | "goal";

export const indicatorMeta: Record<
  IndicatorKey,
  { label: string; color: string }
> = {
  wealth: { label: "Tài sản", color: "#3E8BD7" },
  saving: { label: "Tiết kiệm", color: "#2FA66F" },
  happiness: { label: "Hạnh phúc", color: "#EF8D70" },
  risk: { label: "Rủi ro", color: "#7456B8" },
  goal: { label: "Mục tiêu", color: "#D09C00" },
};

// Nội dung và hình ảnh chương là catalog cố định của ứng dụng.
// Backend chỉ trả tiến độ/kết quả và được ghép vào catalog bằng chapter id.
export const chapterCatalog = [
  {
    chapter: 1,
    title: "Tiền đầu tiên",
    theme: "Needs or Wants",
    image: require("../../assets/images/finteen/chapter-scope-01.png"),
  },
  {
    chapter: 2,
    title: "Tháng đầu tiên và mục tiêu lớn",
    theme: "Budget Builder · Savings Race",
    image: require("../../assets/images/finteen/chapter-scope-02.png"),
  },
  {
    chapter: 3,
    title: "Công việc đầu tiên",
    theme: "Career Match",
    image: require("../../assets/images/finteen/chapter-scope-03.png"),
  },
  {
    chapter: 4,
    title: "Mua thông minh",
    theme: "Smart Shopping",
    image: require("../../assets/images/finteen/chapter-scope-04.png"),
  },
  {
    chapter: 5,
    title: "Ngân hàng và lãi",
    theme: "Compound Timeline",
    image: require("../../assets/images/finteen/chapter-scope-05.png"),
  },
  {
    chapter: 6,
    title: "Mượn tiền có dễ không?",
    theme: "Loan Detective",
    image: require("../../assets/images/finteen/chapter-scope-06.png"),
  },
  {
    chapter: 7,
    title: "Biến cố bất ngờ",
    theme: "Scam or Safe",
    image: require("../../assets/images/finteen/chapter-scope-07.png"),
  },
  {
    chapter: 8,
    title: "Tiền sinh tiền và kế hoạch 18 tuổi",
    theme: "Portfolio Builder · Life Planner",
    image: require("../../assets/images/finteen/chapter-scope-08.png"),
  },
] as const;

export const learnerDirectory = [
  {
    id: "slot-an",
    name: "Nguyễn Minh An",
    code: "AN2026",
    groupType: "FAMILY",
    group: "Gia đình của An",
    className: "",
    chaptersDone: 3,
    lastActive: "Hôm qua, 20:14",
    initial: "A",
    color: "#FFF1A8",
  },
  {
    id: "slot-linh",
    name: "Nguyễn Gia Linh",
    code: "LINH2026",
    groupType: "FAMILY",
    group: "Gia đình của An",
    className: "",
    chaptersDone: 1,
    lastActive: "02/10, 19:42",
    initial: "L",
    color: "#EDE6FF",
  },
  {
    id: "slot-minh",
    name: "Trần Hoàng Minh",
    code: "MINH10A2",
    groupType: "CLASS",
    group: "Lớp 10A2",
    className: "10A2",
    chaptersDone: 5,
    lastActive: "Hôm nay, 08:20",
    initial: "M",
    color: "#DDEEFF",
  },
  {
    id: "slot-thao",
    name: "Lê Phương Thảo",
    code: "THAO10A2",
    groupType: "CLASS",
    group: "Lớp 10A2",
    className: "10A2",
    chaptersDone: 4,
    lastActive: "Hôm qua, 21:05",
    initial: "T",
    color: "#FFE3D7",
  },
  {
    id: "slot-khang",
    name: "Phạm Đức Khang",
    code: "KHANG10A2",
    groupType: "CLASS",
    group: "Lớp 10A2",
    className: "10A2",
    chaptersDone: 2,
    lastActive: "03/10, 18:30",
    initial: "K",
    color: "#DFF4E8",
  },
  {
    id: "slot-vy",
    name: "Võ Ngọc Vy",
    code: "VY10A2",
    groupType: "CLASS",
    group: "Lớp 10A2",
    className: "10A2",
    chaptersDone: 6,
    lastActive: "Hôm nay, 07:55",
    initial: "V",
    color: "#FFF1A8",
  },
] as const;

export const activePlans = {
  PARENT: {
    name: "FinTeen Gia đình",
    status: "ACTIVE",
  },
  TEACHER: {
    name: "FinTeen Lớp học",
    status: "ACTIVE",
  },
} as const;

// Mobile chỉ phản ánh phạm vi đã được cấp trên web. Giáo viên quản lý đúng
// một lớp; học sinh thuộc trực tiếp lớp, không có tầng nhóm trung gian.
export const teacherClass = {
  id: "class-10a2",
  name: "Lớp 10A2",
  schoolYear: "2026–2027",
  studentLimit: 40,
  studentIds: ["slot-minh", "slot-thao", "slot-khang", "slot-vy"],
} as const;

export const familyAccount = {
  id: "family-an",
  name: "Gia đình của An",
  childLimit: 4,
  childIds: ["slot-an", "slot-linh"],
} as const;

export const quizLiveProgress = [
  {
    learnerId: "slot-minh",
    quizId: "chi-tieu-thong-minh",
    current: 8,
    total: 10,
    status: "DOING",
  },
  {
    learnerId: "slot-thao",
    quizId: "chi-tieu-thong-minh",
    current: 10,
    total: 10,
    status: "SUBMITTED",
  },
  {
    learnerId: "slot-khang",
    quizId: "chi-tieu-thong-minh",
    current: 3,
    total: 10,
    status: "DOING",
  },
  {
    learnerId: "slot-vy",
    quizId: "chi-tieu-thong-minh",
    current: 0,
    total: 10,
    status: "NOT_STARTED",
  },
] as const;

export const learners = [
  {
    id: "slot-an",
    name: "Nguyễn Minh An",
    code: "AN2026",
    group: "Gia đình của An",
    chaptersDone: 3,
    attemptIndex: 1,
    lastActive: "Hôm qua, 20:14",
    indicators: { wealth: 46, saving: 31, happiness: 62, risk: 40, goal: 55 },
    mastery: [
      { concept: "Nhu cầu và mong muốn", code: "CEE-II.8-1", value: 0.96 },
      { concept: "Lập ngân sách", code: "CEE-II.8-2", value: 0.78 },
      { concept: "Thu nhập và nghề nghiệp", code: "CEE-II.8-3", value: 0.61 },
    ],
    chapters: [
      {
        chapter: 1,
        title: "Tiền đầu tiên",
        theme: "Needs or Wants",
        choices: 4,
        correct: 5,
        total: 6,
        completedAt: "28/09/2026",
        image: require("../../assets/images/finteen/chapter-scope-01.png"),
      },
      {
        chapter: 2,
        title: "Tháng đầu tiên và mục tiêu lớn",
        theme: "Budget Builder · Savings Race",
        choices: 5,
        correct: 6,
        total: 8,
        completedAt: "30/09/2026",
        image: require("../../assets/images/finteen/chapter-scope-02.png"),
      },
      {
        chapter: 3,
        title: "Công việc đầu tiên",
        theme: "Career Match",
        choices: 4,
        correct: 4,
        total: 6,
        completedAt: "03/10/2026",
        image: require("../../assets/images/finteen/chapter-scope-03.png"),
      },
    ],
  },
] as const;

export const dailySummary = {
  date: "03/10/2026",
  source: "AI",
  text: "An đã hoàn thành Chương 3 và thể hiện sự cân nhắc tốt giữa mục tiêu dài hạn với niềm vui hiện tại. Con còn nhầm ở một số tình huống phân loại chi phí cố định và biến đổi.",
  suggestion:
    "Hãy cùng con thử liệt kê 3 khoản chi cố định của gia đình trong tháng này.",
};

export const achievements = [
  {
    code: "FIRST_CHAPTER",
    icon: "🌱",
    name: "Bước đầu tự lập",
    earnedAt: "28/09/2026",
  },
  {
    code: "BUDGET_STARTER",
    icon: "📒",
    name: "Người lập ngân sách",
    earnedAt: "30/09/2026",
  },
  {
    code: "THREE_CHAPTERS",
    icon: "🏅",
    name: "Ba chương bền bỉ",
    earnedAt: "03/10/2026",
  },
] as const;
