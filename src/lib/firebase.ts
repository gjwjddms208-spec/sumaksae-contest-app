import type { Submission, RubricEvaluation } from '../types';

// ============================================================================
// 공모전 시연용 모드 (Contest Demonstration Mode)
// - 실제 Firebase 클라우드 연결 없이 브라우저 로컬 스토리지(localStorage)에서 완결 동작
// - 실제 학생 개인정보 없이 가상 학생 6명(1~6모둠)의 완전한 작도 및 평가 데이터 탑재
// ============================================================================

export const isDemoMode = true;
export const isFirebaseConfigured = false;
export const TEACHER_EMAIL = 'demo-teacher@contest.edu';

// Local storage key for competition demo
const LOCAL_STORAGE_KEY = 'sumaksae_contest_demo_submissions_v1';
const BROADCAST_CHANNEL_NAME = 'sumaksae_demo_channel';
const LOCAL_EVENT_NAME = 'sumaksae_demo_update';

// Helper to normalize gradeClass (e.g., '9', '9반', '3-9반', '3-9' -> '3-9')
export function normalizeGradeClass(cls: string): string {
  if (!cls) return '';
  const trimmed = cls.trim();
  const match = trimmed.match(/^(?:3-)?(\d+)(?:반)?$/);
  if (match && match[1]) {
    return `3-${match[1]}`;
  }
  return trimmed;
}

// 6 Virtual Students (1 student per team across Teams 1 to 6)
export const DEFAULT_SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: 'demo-student-1',
    gradeClass: '3-1',
    studentNo: '05',
    teamNo: 1,
    name: '김민준',
    drawingData: {
      chord1: {
        id: 'c1',
        p1: { x: 190, y: 110 },
        p2: { x: 310, y: 110 },
        midpoint: { x: 250, y: 110 },
        length: 7.1,
        color: '#b83a2b',
        label: '현 AB',
      },
      chord2: {
        id: 'c2',
        p1: { x: 310, y: 110 },
        p2: { x: 395, y: 195 },
        midpoint: { x: 352.5, y: 152.5 },
        length: 7.1,
        color: '#2e6b5e',
        label: '현 CD',
      },
      centerFound: { x: 250, y: 250 },
      radiusFound: 10,
      isRestored: true,
    },
    quizData: {
      distanceOM: 6,
      chordLength: 16,
      userAnswer: '10',
      correctAnswer: 10,
      isCorrect: true,
    },
    reflection: {
      learned:
        '원의 중심에서 현에 내린 수선은 그 현을 수직이등분하고, 역으로 현의 수직이등분선은 원의 중심을 반드시 지난다는 수학적 정리를 증명했습니다. 두 현의 수직이등분선의 유일한 교점이 바로 깨진 수막새의 원래 원의 중심이 됨을 작도로 입증했습니다.',
      felt: '박물관에 1/3 조각만 남아있던 신라시대 수막새의 온전한 형태를 중3 수학의 원의 성질로 직접 복원해 보니 수학이 유물을 살리는 열쇠라는 깊은 감동을 받았습니다.',
      connected:
        '국립문화재연구원에서 깨진 와당, 분청사기 대접, 아치형 석교의 파편을 3D 스캔하여 원형을 복원할 때 호 위의 세 점과 수직이등분선의 교점 원리가 핵심 알고리즘으로 쓰입니다.',
    },
    evaluation: {
      conceptAndReasoning: 'A',
      problemSolvingAndConnection: 'A',
      communicationAndCollaboration: 'A',
      reflectionAndMetacognition: 'A',
      teacherFeedback:
        '현의 수직이등분선 정리를 원의 정의와 결합하여 수학적으로 완벽하게 정당화했습니다. 문화재 복원과의 연계 통찰도 매우 탁월합니다.',
      evaluatedAt: '2026-10-20 10:15',
      teacherName: '수학교사',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'demo-student-2',
    gradeClass: '3-1',
    studentNo: '12',
    teamNo: 2,
    name: '이서윤',
    drawingData: {
      chord1: {
        id: 'c1',
        p1: { x: 175, y: 125 },
        p2: { x: 295, y: 95 },
        midpoint: { x: 235, y: 110 },
        length: 7.3,
        color: '#b83a2b',
        label: '현 AB',
      },
      chord2: {
        id: 'c2',
        p1: { x: 320, y: 115 },
        p2: { x: 400, y: 210 },
        midpoint: { x: 360, y: 162.5 },
        length: 7.3,
        color: '#2e6b5e',
        label: '현 CD',
      },
      centerFound: { x: 250, y: 250 },
      radiusFound: 10,
      isRestored: true,
    },
    quizData: {
      distanceOM: 6,
      chordLength: 16,
      userAnswer: '10',
      correctAnswer: 10,
      isCorrect: true,
    },
    reflection: {
      learned:
        '직각삼각형의 피타고라스 정리 r² = d² + (l/2)²를 적용해 현의 길이 16cm의 절반인 8cm와 중심거리 6cm로부터 반지름 10cm를 정확하게 유도해 냈습니다.',
      felt: '모둠원들과 현의 위치를 어떻게 잡아야 수직이등분선의 교점이 뚜렷하게 잡히는지 실험하고 토의하는 과정에서 협업의 가치를 느꼈습니다.',
      connected:
        '고속도로나 철도 궤도의 완만한 곡선 구간(원호)에서 안전 주행을 위한 곡률 반지름을 계산할 때도 현과 중심거리를 실측해 계산합니다.',
    },
    evaluation: {
      conceptAndReasoning: 'A',
      problemSolvingAndConnection: 'B',
      communicationAndCollaboration: 'A',
      reflectionAndMetacognition: 'A',
      teacherFeedback:
        '피타고라스 정리를 활용한 반지름 계산이 명확하며, 모둠원들과의 원활한 의사소통으로 최적의 작도 위치를 찾아낸 협업 태도가 훌륭합니다.',
      evaluatedAt: '2026-10-20 10:22',
      teacherName: '수학교사',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
  },
  {
    id: 'demo-student-3',
    gradeClass: '3-1',
    studentNo: '19',
    teamNo: 3,
    name: '박도현',
    drawingData: {
      chord1: {
        id: 'c1',
        p1: { x: 200, y: 105 },
        p2: { x: 330, y: 120 },
        midpoint: { x: 265, y: 112.5 },
        length: 7.7,
        color: '#b83a2b',
        label: '현 AB',
      },
      chord2: {
        id: 'c2',
        p1: { x: 280, y: 95 },
        p2: { x: 380, y: 165 },
        midpoint: { x: 330, y: 130 },
        length: 7.2,
        color: '#2e6b5e',
        label: '현 CD',
      },
      centerFound: { x: 250, y: 250 },
      radiusFound: 10,
      isRestored: true,
    },
    quizData: {
      distanceOM: 6,
      chordLength: 16,
      userAnswer: '10',
      correctAnswer: 10,
      isCorrect: true,
    },
    reflection: {
      learned:
        '한 평면 위에서 한 직선 위에 있지 않은 세 점은 단 하나의 원을 결정한다는 원의 결정조건과 삼각형의 외심 원리를 배웠습니다. 수막새 원호 위의 점들이 외접원의 성질을 그대로 지님을 확인했습니다.',
      felt: '교과서 평면 그림으로 볼 때보다 인터랙티브 디지털 도구로 직접 작도하면서 교점이 정확히 찍히는 순간 기하학의 쾌감을 맛보았습니다.',
      connected:
        '깨진 원형 도자기나 접시의 테두리 일부만 수습되었을 때, 남은 호의 곡률을 실측하여 원래 지름을 알아내고 동일한 맞춤 틀을 제작할 수 있습니다.',
    },
    evaluation: {
      conceptAndReasoning: 'A',
      problemSolvingAndConnection: 'A',
      communicationAndCollaboration: 'B',
      reflectionAndMetacognition: 'A',
      teacherFeedback:
        '삼각형의 외심 및 원의 결정조건과 현의 성질을 유기적으로 연계해 깊이 있는 기하학적 이해도를 보여주었습니다.',
      evaluatedAt: '2026-10-20 10:30',
      teacherName: '수학교사',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'demo-student-4',
    gradeClass: '3-1',
    studentNo: '24',
    teamNo: 4,
    name: '정하은',
    drawingData: {
      chord1: {
        id: 'c1',
        p1: { x: 195, y: 115 },
        p2: { x: 305, y: 100 },
        midpoint: { x: 250, y: 107.5 },
        length: 7.2,
        color: '#b83a2b',
        label: '현 AB',
      },
      chord2: {
        id: 'c2',
        p1: { x: 295, y: 100 },
        p2: { x: 390, y: 180 },
        midpoint: { x: 342.5, y: 140 },
        length: 7.4,
        color: '#2e6b5e',
        label: '현 CD',
      },
      centerFound: { x: 250, y: 250 },
      radiusFound: 10,
      isRestored: true,
    },
    quizData: {
      distanceOM: 6,
      chordLength: 16,
      userAnswer: '10',
      correctAnswer: 10,
      isCorrect: true,
    },
    reflection: {
      learned:
        '현의 수직이등분선 위에 원의 중심이 위치하므로, 평행하지 않은 두 현의 수직이등분선의 교점은 수학적으로 오직 하나만 존재한다는 유일성을 확인했습니다.',
      felt: '처음에는 현의 길이를 너무 짧게 잡아 오차가 생겼었는데, 현을 충분히 길게 설정해야 교점의 정밀도가 올라간다는 과학적 통찰을 모둠 실험으로 배웠습니다.',
      connected:
        '천문 관측에서 망원경 시야에 일부 호만 들어오는 혜성의 궤도나 행성의 고리 일부를 통해 궤도 전체의 곡률 반경을 역산할 때 활용됩니다.',
    },
    evaluation: {
      conceptAndReasoning: 'B',
      problemSolvingAndConnection: 'A',
      communicationAndCollaboration: 'A',
      reflectionAndMetacognition: 'A',
      teacherFeedback:
        '작도 오차를 줄이기 위해 모둠원들과 현의 길이를 다양하게 조절해 본 메타인지적 실험 탐구 과정이 매우 인상적입니다.',
      evaluatedAt: '2026-10-20 10:35',
      teacherName: '수학교사',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'demo-student-5',
    gradeClass: '3-1',
    studentNo: '31',
    teamNo: 5,
    name: '최준우',
    drawingData: {
      chord1: {
        id: 'c1',
        p1: { x: 185, y: 120 },
        p2: { x: 315, y: 110 },
        midpoint: { x: 250, y: 115 },
        length: 7.3,
        color: '#b83a2b',
        label: '현 AB',
      },
      chord2: {
        id: 'c2',
        p1: { x: 315, y: 110 },
        p2: { x: 395, y: 200 },
        midpoint: { x: 355, y: 155 },
        length: 7.2,
        color: '#2e6b5e',
        label: '현 CD',
      },
      centerFound: { x: 250, y: 250 },
      radiusFound: 10,
      isRestored: true,
    },
    quizData: {
      distanceOM: 6,
      chordLength: 16,
      userAnswer: '10',
      correctAnswer: 10,
      isCorrect: true,
    },
    reflection: {
      learned:
        '현의 길이 16cm의 절반인 8cm와 중심에서 현까지의 거리 6cm가 직각삼각형의 두 변이 되고, 빗변인 반지름 r = √(6² + 8²) = √100 = 10cm가 됨을 증명했습니다.',
      felt: '선조들이 와당을 만들 때 단순한 눈대중이 아니라 기하학적 비례와 대칭을 철저히 고려했다는 점에 민족적 자긍심을 느꼈습니다.',
      connected:
        '터널 굴착 토목공사 시 터널 상부 반원형 아치의 곡률 중심을 찾고 붕괴 방지용 아치 앵커 지지대를 설계할 때 필수적인 원리입니다.',
    },
    evaluation: {
      conceptAndReasoning: 'A',
      problemSolvingAndConnection: 'B',
      communicationAndCollaboration: 'A',
      reflectionAndMetacognition: 'B',
      teacherFeedback:
        '피타고라스 수(6-8-10, 즉 3:4:5의 배수)를 정확하게 활용하였으며, 역사적 유물과 토목 건축을 잇는 통섭적 사고를 보여주었습니다.',
      evaluatedAt: '2026-10-20 10:40',
      teacherName: '수학교사',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'demo-student-6',
    gradeClass: '3-1',
    studentNo: '38',
    teamNo: 6,
    name: '윤지아',
    drawingData: {
      chord1: {
        id: 'c1',
        p1: { x: 190, y: 115 },
        p2: { x: 320, y: 115 },
        midpoint: { x: 255, y: 115 },
        length: 7.4,
        color: '#b83a2b',
        label: '현 AB',
      },
      chord2: {
        id: 'c2',
        p1: { x: 300, y: 105 },
        p2: { x: 395, y: 190 },
        midpoint: { x: 347.5, y: 147.5 },
        length: 7.3,
        color: '#2e6b5e',
        label: '현 CD',
      },
      centerFound: { x: 250, y: 250 },
      radiusFound: 10,
      isRestored: true,
    },
    quizData: {
      distanceOM: 6,
      chordLength: 16,
      userAnswer: '10',
      correctAnswer: 10,
      isCorrect: true,
    },
    reflection: {
      learned:
        '원의 중심 O에서 현 AB에 내린 수선의 발 M에 대해 직각삼각형 OAM과 OBM이 RHA(또는 RHS) 합동이 되므로 현이 이등분된다는 논리적 정당화 과정을 확실히 마스터했습니다.',
      felt: '웹 기반 시뮬레이터로 조작하니 컴퍼스와 자 없이도 마우스 터치 한 번으로 중심과 연화문 테두리가 부활하여 게임 스테이지를 클리어하는 듯한 몰입감이 있었습니다.',
      connected:
        '스마트폰 카메라의 홍채·얼굴 윤곽 인식 기술에서 눈동자 일부가 눈꺼풀에 가려졌을 때 노출된 호의 윤곽만으로 동공의 중심 좌표를 추적하는 알고리즘에 활용됩니다.',
    },
    evaluation: {
      conceptAndReasoning: 'A',
      problemSolvingAndConnection: 'A',
      communicationAndCollaboration: 'A',
      reflectionAndMetacognition: 'A',
      teacherFeedback:
        '삼각형 합동 조건을 통한 엄밀한 연역적 정당화와 스마트폰 비전 인식 AI 알고리즘과의 최신 융합적 연결 사고가 매우 탁월합니다.',
      evaluatedAt: '2026-10-20 10:45',
      teacherName: '수학교사',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// Read submissions from localStorage (initialize with 6 virtual students if empty)
export function getLocalSubmissions(): Submission[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local demo submissions', e);
  }
  // Initialize default 6 students
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_SUBMISSIONS));
  } catch (e) {
    console.error('Error setting initial demo submissions', e);
  }
  return DEFAULT_SAMPLE_SUBMISSIONS;
}

// Save submissions to localStorage & broadcast
export function saveLocalSubmissions(submissions: Submission[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submissions));
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({ type: 'UPDATE', submissions });
      channel.close();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LOCAL_EVENT_NAME, { detail: submissions }));
    }
  } catch (e) {
    console.error('Error writing local demo submissions', e);
  }
}

// Reset data to default 6 virtual students anytime
export function resetToDefaultDemoSubmissions(): Submission[] {
  saveLocalSubmissions(DEFAULT_SAMPLE_SUBMISSIONS);
  return DEFAULT_SAMPLE_SUBMISSIONS;
}

// Real-time local subscription
export function subscribeToSubmissions(
  callback: (submissions: Submission[]) => void
): () => void {
  // Immediately provide current data
  callback(getLocalSubmissions());

  let channel: BroadcastChannel | null = null;
  const storageListener = () => {
    callback(getLocalSubmissions());
  };
  const localEventListener = (e: any) => {
    callback(e.detail || getLocalSubmissions());
  };

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === 'UPDATE') {
        callback(event.data.submissions);
      }
    };
  }

  window.addEventListener('storage', storageListener);
  window.addEventListener(LOCAL_EVENT_NAME, localEventListener);

  return () => {
    window.removeEventListener('storage', storageListener);
    window.removeEventListener(LOCAL_EVENT_NAME, localEventListener);
    if (channel) {
      channel.close();
    }
  };
}

// Student submits work in demo mode
export async function submitStudentWork(
  data: Omit<Submission, 'id' | 'createdAt'>
): Promise<string> {
  const normalizedData = {
    ...data,
    gradeClass: normalizeGradeClass(data.gradeClass),
    studentNo: String(data.studentNo).padStart(2, '0'),
  };

  const list = getLocalSubmissions();
  const newSubmission: Submission = {
    ...normalizedData,
    id: 'demo-sub-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
  };
  const updated = [newSubmission, ...list];
  saveLocalSubmissions(updated);
  return newSubmission.id;
}

// Teacher updates rubric evaluation in demo mode
export async function updateTeacherEvaluation(
  submissionId: string,
  evaluation: RubricEvaluation
): Promise<void> {
  const list = getLocalSubmissions();
  const index = list.findIndex((item) => item.id === submissionId);
  if (index !== -1) {
    list[index].evaluation = evaluation;
    saveLocalSubmissions([...list]);
  }
}

// Delete submissions by class in demo mode
export async function deleteSubmissionsByClass(
  gradeClass: string,
  _currentList?: Submission[]
): Promise<number> {
  const localList = getLocalSubmissions();
  const normalizedTarget = normalizeGradeClass(gradeClass);
  const remaining = localList.filter((s) => {
    if (gradeClass === 'ALL') return false;
    return normalizeGradeClass(s.gradeClass) !== normalizedTarget;
  });
  const deletedCount = localList.length - remaining.length;
  saveLocalSubmissions(remaining);
  return deletedCount;
}

// Delete single submission in demo mode
export async function deleteSingleSubmission(submissionId: string): Promise<void> {
  const localList = getLocalSubmissions();
  saveLocalSubmissions(localList.filter((s) => s.id !== submissionId));
}

// Mock auth interface for compatibility
export interface User {
  email: string | null;
  displayName?: string | null;
}

export const auth = null;

export function isAuthorizedTeacher(_user: any): boolean {
  return true;
}

export async function loginTeacherWithGoogle(): Promise<User> {
  return { email: TEACHER_EMAIL, displayName: '시연용 수학교사' };
}

export async function logoutTeacher(): Promise<void> {
  // No-op in demo mode
}
