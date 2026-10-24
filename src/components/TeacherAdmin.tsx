import React, { useState } from 'react';
import type { RubricEvaluation, RubricGrade, Submission } from '../types';
import {
  updateTeacherEvaluation,
  submitStudentWork,
  normalizeGradeClass,
  deleteSubmissionsByClass,
  deleteSingleSubmission,
  resetToDefaultDemoSubmissions,
} from '../lib/firebase';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Edit3,
  Search,
  BookOpen,
  Filter,
  Save,
  Check,
  Sparkles,
  PlusCircle,
  RotateCcw,
  X,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface Props {
  submissions: Submission[];
  onBackToApp: () => void;
  onOpenFirebaseGuide?: () => void;
}

export const TeacherAdmin: React.FC<Props> = ({ submissions, onBackToApp, onOpenFirebaseGuide }) => {
  // Google Authentication state
  // Demo Mode status
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetDemoData = () => {
    if (window.confirm('가상 학생 6명(1~6모둠)의 초기 시연 데이터로 복원하시겠습니까?\n(직접 추가하거나 수정한 데이터는 초기화됩니다)')) {
      resetToDefaultDemoSubmissions();
      setResetStatus('가상 학생 6명의 초기 데이터로 복원되었습니다.');
      setTimeout(() => setResetStatus(null), 3000);
    }
  };

  // Class deletion modal states
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTargetClass, setDeleteTargetClass] = useState<string>('ALL');
  const [deletingClass, setDeletingClass] = useState(false);
  const [deleteStatusMsg, setDeleteStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Table filter states
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<number | 'ALL'>('ALL');
  const [evalFilter, setEvalFilter] = useState<'ALL' | 'EVALUATED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active grading modal
  const [evaluatingSub, setEvaluatingSub] = useState<Submission | null>(null);
  const [conceptGrade, setConceptGrade] = useState<RubricGrade>('A');
  const [problemGrade, setProblemGrade] = useState<RubricGrade>('A');
  const [commGrade, setCommGrade] = useState<RubricGrade>('A');
  const [reflectionGrade, setReflectionGrade] = useState<RubricGrade>('A');
  const [feedbackText, setFeedbackText] = useState('');
  const [savingEval, setSavingEval] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manual student submission modal states (for quick registration / testing in local mode)
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [manualGradeClass, setManualGradeClass] = useState('3-5');
  const [manualStudentNo, setManualStudentNo] = useState('01');
  const [manualTeamNo, setManualTeamNo] = useState(1);
  const [manualName, setManualName] = useState('');
  const [manualAnswer, setManualAnswer] = useState('10');
  const [manualIsRestored, setManualIsRestored] = useState(true);
  const [manualLearned, setManualLearned] = useState('원의 중심에서 현에 내린 수선이 현을 수직이등분하고, 역으로 현의 수직이등분선은 원의 중심을 반드시 지난다는 성질을 탐구했습니다.');
  const [manualFelt, setManualFelt] = useState('모둠원들과 함께 깨진 수막새의 중심을 피타고라스 정리와 작도로 복원하는 과정이 흥미로웠습니다.');
  const [manualConnected, setManualConnected] = useState('도로 커브길의 곡률 안전 설계나 깨진 원형 문화재 복원 과정에 응용할 수 있습니다.');
  const [manualAddSuccess, setManualAddSuccess] = useState(false);
  const [manualAddLoading, setManualAddLoading] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [codeImportMsg, setCodeImportMsg] = useState('');

  const handleImportCode = () => {
    if (!pastedCode.trim()) return;
    try {
      const decoded = decodeURIComponent(escape(atob(pastedCode.trim())));
      const data = JSON.parse(decoded);
      if (data.name) setManualName(data.name);
      if (data.gradeClass) setManualGradeClass(data.gradeClass);
      if (data.studentNo) setManualStudentNo(data.studentNo);
      if (data.teamNo) setManualTeamNo(Number(data.teamNo) || 1);
      if (data.drawingData?.isRestored !== undefined) setManualIsRestored(Boolean(data.drawingData.isRestored));
      if (data.quizData?.userAnswer) setManualAnswer(String(data.quizData.userAnswer));
      if (data.reflection?.learned) setManualLearned(data.reflection.learned);
      if (data.reflection?.felt) setManualFelt(data.reflection.felt);
      if (data.reflection?.connected) setManualConnected(data.reflection.connected);
      setCodeImportMsg('학생 제출 데이터가 성공적으로 자동 입력되었습니다!');
      setTimeout(() => setCodeImportMsg(''), 3000);
    } catch {
      setCodeImportMsg('올바르지 않은 제출 코드입니다. 코드를 다시 확인해 주세요.');
    }
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    setManualAddLoading(true);

    try {
      await submitStudentWork({
        gradeClass: manualGradeClass.trim(),
        studentNo: manualStudentNo.trim().padStart(2, '0'),
        teamNo: manualTeamNo,
        name: manualName.trim(),
        drawingData: {
          chord1: {
            id: 'c1',
            p1: { x: 180, y: 110 },
            p2: { x: 300, y: 110 },
            midpoint: { x: 240, y: 110 },
            length: 7.5,
            color: '#b83a2b',
            label: '현 AB',
          },
          chord2: {
            id: 'c2',
            p1: { x: 300, y: 110 },
            p2: { x: 390, y: 190 },
            midpoint: { x: 345, y: 150 },
            length: 7.2,
            color: '#2e6b5e',
            label: '현 CD',
          },
          centerFound: { x: 250, y: 250 },
          radiusFound: 10,
          isRestored: manualIsRestored,
        },
        quizData: {
          distanceOM: 6,
          chordLength: 16,
          userAnswer: manualAnswer.trim(),
          correctAnswer: 10,
          isCorrect: manualAnswer.trim() === '10',
        },
        reflection: {
          learned: manualLearned.trim(),
          felt: manualFelt.trim(),
          connected: manualConnected.trim(),
        },
      });

      setManualAddSuccess(true);
      setTimeout(() => {
        setShowManualAddModal(false);
        setManualAddSuccess(false);
      }, 900);
    } catch (err) {
      console.error('Failed to manually register submission:', err);
    } finally {
      setManualAddLoading(false);
    }
  };

  // Execute batch class deletion
  const handleExecuteDeleteClass = async () => {
    setDeletingClass(true);
    setDeleteStatusMsg(null);
    try {
      const count = await deleteSubmissionsByClass(deleteTargetClass, submissions);
      setDeleteStatusMsg({
        type: 'success',
        text: `${deleteTargetClass === 'ALL' ? '전체 학급' : deleteTargetClass + '반'} 데이터 ${count}건이 삭제되었습니다.`,
      });
      setTimeout(() => {
        setShowDeleteConfirmModal(false);
        setDeleteStatusMsg(null);
      }, 1400);
    } catch (err: any) {
      console.error('Delete error:', err);
      setDeleteStatusMsg({
        type: 'error',
        text: '데이터 삭제 실패: ' + (err.message || '권한이 없거나 오류가 발생했습니다.'),
      });
    } finally {
      setDeletingClass(false);
    }
  };

  // Single submission delete
  const handleDeleteSingle = async (sub: Submission) => {
    if (!window.confirm(`${sub.gradeClass} ${sub.studentNo}번 ${sub.name} 학생의 제출 기록을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await deleteSingleSubmission(sub.id);
    } catch (err) {
      console.error('Single delete error:', err);
    }
  };

  const openGradingModal = (sub: Submission) => {
    setEvaluatingSub(sub);
    setSaveSuccess(false);
    if (sub.evaluation) {
      setConceptGrade(sub.evaluation.conceptAndReasoning);
      setProblemGrade(sub.evaluation.problemSolvingAndConnection);
      setCommGrade(sub.evaluation.communicationAndCollaboration);
      setReflectionGrade(sub.evaluation.reflectionAndMetacognition);
      setFeedbackText(sub.evaluation.teacherFeedback || '');
    } else {
      setConceptGrade('A');
      setProblemGrade(sub.quizData.isCorrect ? 'A' : 'B');
      setCommGrade('A');
      setReflectionGrade('A');
      setFeedbackText(
        `${sub.name} 학생은 수막새 복원 탐구에서 현의 수직이등분선 성질을 잘 이해하고 성실히 참여하였습니다.`
      );
    }
  };

  const handleSaveEvaluation = async () => {
    if (!evaluatingSub) return;
    setSavingEval(true);

    const evaluationObj: RubricEvaluation = {
      conceptAndReasoning: conceptGrade,
      problemSolvingAndConnection: problemGrade,
      communicationAndCollaboration: commGrade,
      reflectionAndMetacognition: reflectionGrade,
      teacherFeedback: feedbackText.trim(),
      evaluatedAt: new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      teacherName: '수학교사',
    };

    try {
      await updateTeacherEvaluation(evaluatingSub.id, evaluationObj);
      setSaveSuccess(true);
      setTimeout(() => {
        setEvaluatingSub(null);
        setSaveSuccess(false);
      }, 1000);
    } catch (e) {
      console.error('Failed to save evaluation', e);
    } finally {
      setSavingEval(false);
    }
  };

  // CSV Export for school records
  const exportToCSV = () => {
    const headers = [
      '학급',
      '출석번호',
      '모둠',
      '이름',
      '중심복원성공',
      '피타고라스답변',
      '정답여부',
      '배운점',
      '느낀점',
      '실생활연결',
      '개념이해추론',
      '문제해결삶연결',
      '의사소통협업',
      '성찰메타인지',
      '교사피드백',
      '제출일시',
    ];

    const rows = submissions.map((s) => [
      `"${s.gradeClass}"`,
      `"${s.studentNo}"`,
      `"${s.teamNo}모둠"`,
      `"${s.name}"`,
      `"${s.drawingData.isRestored ? 'O' : 'X'}"`,
      `"${s.quizData.userAnswer}"`,
      `"${s.quizData.isCorrect ? '정답' : '오답'}"`,
      `"${s.reflection.learned.replace(/"/g, '""')}"`,
      `"${s.reflection.felt.replace(/"/g, '""')}"`,
      `"${s.reflection.connected.replace(/"/g, '""')}"`,
      `"${s.evaluation?.conceptAndReasoning || '미평가'}"`,
      `"${s.evaluation?.problemSolvingAndConnection || '미평가'}"`,
      `"${s.evaluation?.communicationAndCollaboration || '미평가'}"`,
      `"${s.evaluation?.reflectionAndMetacognition || '미평가'}"`,
      `"${(s.evaluation?.teacherFeedback || '').replace(/"/g, '""')}"`,
      `"${s.createdAt || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `수막새_복원_수학탐구_수행평가_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (
      classFilter !== 'ALL' &&
      normalizeGradeClass(s.gradeClass) !== normalizeGradeClass(classFilter)
    ) {
      return false;
    }
    if (teamFilter !== 'ALL' && s.teamNo !== teamFilter) return false;
    if (evalFilter === 'EVALUATED' && !s.evaluation) return false;
    if (evalFilter === 'PENDING' && s.evaluation) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.gradeClass.toLowerCase().includes(q) ||
        normalizeGradeClass(s.gradeClass).toLowerCase().includes(q) ||
        s.studentNo.includes(q)
      );
    }
    return true;
  });

  // Calculate statistics (respecting active classFilter)
  const classSubmissions =
    classFilter === 'ALL'
      ? submissions
      : submissions.filter(
          (s) => normalizeGradeClass(s.gradeClass) === normalizeGradeClass(classFilter)
        );

  const total = classSubmissions.length;
  const grandTotal = submissions.length;
  const evaluatedCount = classSubmissions.filter((s) => s.evaluation).length;
  const restoredCount = classSubmissions.filter((s) => s.drawingData?.isRestored).length;
  const quizAccuracy =
    total > 0
      ? Math.round(
          (classSubmissions.filter((s) => s.quizData?.isCorrect).length / total) * 100
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Reset Notification Toast */}
      {resetStatus && (
        <div className="p-3.5 rounded-xl bg-[#2e5a59] text-white text-xs font-semibold shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{resetStatus}</span>
          </div>
          <button
            onClick={() => setResetStatus(null)}
            className="text-xs text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Teacher Top Dashboard Header */}
      <div className="bg-[#f9f7f2] p-4 sm:p-6 rounded-2xl border border-[#2d2926]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8b4513] mb-1 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">교사 전용 평가 및 루브릭 관리실 (공모전 시연 모드)</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-batang font-bold text-[#2d2926] break-keep">
            중학교 3학년 수학 수행평가 종합 대시보드
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#726960]">
            <span>단원: 원의 현의 성질 &amp; 피타고라스 정리 융합 탐구</span>
            <span>•</span>
            <span className="inline-flex items-center space-x-1 text-[#8b4513] bg-[#8b4513]/10 px-2 py-0.5 rounded-md border border-[#8b4513]/25 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3 text-[#8b4513]" />
              <span>비밀번호 없이 즉시 열람 및 시연 가능</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-center shrink-0 flex-wrap gap-y-1">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#8b4513]/30 bg-white text-[#8b4513] hover:bg-[#8b4513]/10 text-xs font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="가상 학생 6명(1~6모둠)의 초기 데이터로 복원"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">가상 학생 6명 기본값 복원</span>
          </button>
          <button
            onClick={() => {
              setManualGradeClass(classFilter !== 'ALL' ? classFilter : '3-1');
              setManualName(searchQuery || '');
              setShowManualAddModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#8b4513] hover:bg-[#703810] text-white text-xs font-medium shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="학생 제출 내역 직접 등록 (시연 테스트용)"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">학생 데이터 직접 등록</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#2e5a59] hover:bg-[#234544] text-white text-xs font-medium shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">CSV 성적표 내보내기</span>
          </button>
          <button
            onClick={onBackToApp}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-[#2d2926]/20 bg-white text-[#2d2926] hover:bg-[#f5f2ed] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="학생 탐구 화면으로 이동"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">학생 화면</span>
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      <div className="bg-[#f0ece1] border-2 border-[#8b4513]/25 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#8b4513] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-batang font-bold">
            瓦
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#2d2926] flex items-center gap-2 break-keep">
              <span>공모전 시연 모드 (Browser Local Demo)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#8b4513] text-white font-semibold shrink-0">
                실제 학생 데이터 없음
              </span>
            </h4>
            <p className="text-xs text-[#726960] mt-1 leading-relaxed break-keep">
              본 앱은 공모전 심사 및 기능 체험을 위한 전용 버전입니다. 실제 Firebase 클라우드 연결 없이 브라우저 내(localStorage)에서 안전하게 구동되며,
              <strong> 1모둠부터 6모둠까지 가상 학생 6명의 수막새 복원 작도, 피타고라스 계산, 배·느·실 성찰일지, 루브릭 채점 및 교사 피드백</strong>이 사전 탑재되어 있습니다. 자유롭게 채점 수정, 삭제, 학생 추가를 테스트해 보실 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-3 py-2 rounded-xl bg-[#8b4513] hover:bg-[#72380f] text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            기본 데이터로 초기화
          </button>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#f9f7f2] p-4 rounded-xl border border-[#2d2926]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#726960] mb-1">
            <span className="whitespace-nowrap truncate">
              {classFilter === 'ALL' ? '총 제출 학생' : `${classFilter}반 제출 학생`}
            </span>
            <Users className="w-4 h-4 text-[#8b4513] shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#2d2926]">
            {total}명
            {classFilter !== 'ALL' && (
              <span className="text-xs font-normal text-[#726960] ml-1.5 font-sans">
                / 전체 {grandTotal}명
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#726960] mt-1">
            {classFilter === 'ALL' ? '전체 등록된 학급 기준' : `${classFilter}반 필터 적용`}
          </div>
        </div>

        <div className="bg-[#f9f7f2] p-4 rounded-xl border border-[#2d2926]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#726960] mb-1">
            <span className="whitespace-nowrap truncate">수막새 작도 복원율</span>
            <CheckCircle2 className="w-4 h-4 text-[#2e5a59] shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#2e5a59]">
            {total > 0 ? Math.round((restoredCount / total) * 100) : 0}%
          </div>
          <div className="text-[11px] text-[#726960] mt-1">
            {total > 0 ? `${restoredCount}명 중심점 도출 성공` : '제출 대기 중'}
          </div>
        </div>

        <div className="bg-[#f9f7f2] p-4 rounded-xl border border-[#2d2926]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#726960] mb-1">
            <span className="whitespace-nowrap truncate">피타고라스 계산 정답률</span>
            <CheckCircle2 className="w-4 h-4 text-[#8b4513] shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#8b4513]">{quizAccuracy}%</div>
          <div className="text-[11px] text-[#726960] mt-1">
            {total > 0 ? '반지름 r = 10cm 계산' : '제출 대기 중'}
          </div>
        </div>

        <div className="bg-[#f9f7f2] p-4 rounded-xl border border-[#2d2926]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#726960] mb-1">
            <span className="whitespace-nowrap truncate">루브릭 채점 완료율</span>
            <Award className="w-4 h-4 text-[#c04000] shrink-0" />
          </div>
          <div className="text-2xl font-bold text-[#c04000]">
            {total > 0 ? Math.round((evaluatedCount / total) * 100) : 0}%
          </div>
          <div className="text-[11px] text-[#726960] mt-1">
            {total > 0 ? `${evaluatedCount} / ${total}명 피드백 완료` : '제출 대기 중'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#f9f7f2] p-4 rounded-xl border border-[#2d2926]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {/* Class Filter (3-1 ~ 3-9) */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#726960] font-medium hidden sm:inline">학급:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#2d2926]/15 bg-white text-xs font-semibold text-[#8b4513] focus:outline-none"
            >
              <option value="ALL">전체 학급</option>
              {['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9'].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#726960] font-medium hidden sm:inline">모둠:</span>
            <select
              value={teamFilter}
              onChange={(e) =>
                setTeamFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="px-2.5 py-1.5 rounded-lg border border-[#2d2926]/15 bg-white text-xs text-[#2d2926] focus:outline-none"
            >
              <option value="ALL">전체 모둠</option>
              {[1, 2, 3, 4, 5, 6].map((t) => (
                <option key={t} value={t}>
                  {t}모둠
                </option>
              ))}
            </select>
          </div>

          {/* Evaluation Status Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#726960] font-medium hidden sm:inline">채점:</span>
            <select
              value={evalFilter}
              onChange={(e) => setEvalFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-[#2d2926]/15 bg-white text-xs text-[#2d2926] focus:outline-none"
            >
              <option value="ALL">전체 상태</option>
              <option value="PENDING">미채점 (대기중)</option>
              <option value="EVALUATED">채점 완료</option>
            </select>
          </div>
        </div>

        {/* Right Action Tools: Delete Class & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Class Batch Delete Button */}
          <button
            type="button"
            onClick={() => {
              setDeleteTargetClass(classFilter);
              setDeleteStatusMsg(null);
              setShowDeleteConfirmModal(true);
            }}
            disabled={classSubmissions.length === 0}
            className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
            title="선택한 학급의 학생 제출 데이터 일괄 영구 삭제"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>
              {classFilter === 'ALL'
                ? '전체 학급 데이터 일괄 삭제'
                : `${classFilter}반 데이터 전체 삭제`}
            </span>
          </button>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[#726960] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학생 이름 또는 번호 검색..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#2d2926]/15 bg-white text-xs text-[#2d2926] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-[#f9f7f2] rounded-2xl border border-[#2d2926]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2d2926]">
            <thead className="bg-[#f5f2ed] text-[#2d2926] font-semibold border-b border-[#2d2926]/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">학급/번호</th>
                <th className="py-3 px-4">모둠</th>
                <th className="py-3 px-4">이름</th>
                <th className="py-3 px-4">작도 복원</th>
                <th className="py-3 px-4">피타고라스 계산</th>
                <th className="py-3 px-4">루브릭 평가 등급</th>
                <th className="py-3 px-4">제출 시각</th>
                <th className="py-3 px-4 text-center">평가 및 피드백</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2926]/10">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center">
                    <div className="max-w-lg mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#8b4513]/10 text-[#8b4513] flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#2d2926]">
                          {classFilter !== 'ALL' ? `[${classFilter}반]` : ''} {searchQuery ? `'${searchQuery}'` : ''} 일치하는 제출 내역이 없습니다.
                        </h4>
                        <p className="text-xs text-[#726960] mt-1">
                          {submissions.length > 0 ? (
                            <>
                              현재 등록된 학급은{' '}
                              <strong className="text-[#8b4513]">
                                {Array.from(new Set(submissions.map((s) => s.gradeClass))).join(', ')}반
                              </strong>{' '}
                              (총 {submissions.length}명) 입니다.
                            </>
                          ) : (
                            '아직 등록된 학생 제출 내역이 없습니다.'
                          )}
                        </p>

                          <div className="text-[11px] text-[#8b4513] bg-[#8b4513]/10 border border-[#8b4513]/25 rounded-xl p-3 mt-3 text-left leading-relaxed">
                            <span className="font-bold block mb-0.5">
                              💡 공모전 시연 안내
                            </span>
                            상단의 <strong>[가상 학생 6명 기본값 복원]</strong> 버튼을 누르면 1모둠부터 6모둠까지 가상 학생 6명의 완전한 작도 및 평가 데이터가 즉시 다시 로드됩니다.
                          </div>
                      </div>

                      <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
                        {(classFilter !== 'ALL' || teamFilter !== 'ALL' || evalFilter !== 'ALL' || searchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              setClassFilter('ALL');
                              setTeamFilter('ALL');
                              setEvalFilter('ALL');
                              setSearchQuery('');
                            }}
                            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#2d2926]/15 bg-white text-xs font-semibold text-[#2d2926] hover:bg-[#f5f2ed] shadow-xs transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#8b4513]" />
                            <span>전체 학급 보기로 필터 초기화</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setManualGradeClass(classFilter !== 'ALL' ? classFilter : '3-5');
                            setManualName(searchQuery || '');
                            setShowManualAddModal(true);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#8b4513] hover:bg-[#703810] text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>학생 제출 내역 직접 등록</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      {sub.gradeClass} {sub.studentNo}번
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#2d2926]/10 text-[#2d2926] font-bold text-[10px]">
                        {sub.teamNo}모둠
                      </span>
                    </td>
                    <td className="py-3 px-4 font-batang font-bold text-[#2d2926]">
                      {sub.name}
                    </td>
                    <td className="py-3 px-4">
                      {sub.drawingData?.isRestored ? (
                        <span className="inline-flex items-center space-x-1 text-[#2e5a59] font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>복원성공</span>
                        </span>
                      ) : (
                        <span className="text-[#8b4513] text-[11px]">진행중</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold ${
                          sub.quizData?.isCorrect ? 'text-[#2e5a59]' : 'text-[#c04000]'
                        }`}
                      >
                        {sub.quizData?.userAnswer || '미입력'}cm ({sub.quizData?.isCorrect ? '정답' : '오답'})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sub.evaluation ? (
                        <div className="flex space-x-1 text-[11px] font-mono font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-[#c04000]/15 text-[#c04000]" title="개념 이해 및 추론">
                            개:{sub.evaluation.conceptAndReasoning}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#2e5a59]/15 text-[#2e5a59]" title="문제 해결 및 연결">
                            문:{sub.evaluation.problemSolvingAndConnection}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#8b4513]/15 text-[#8b4513]" title="의사소통 및 협업">
                            소:{sub.evaluation.communicationAndCollaboration}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#2d2926]/15 text-[#2d2926]" title="성찰 및 메타인지">
                            성:{sub.evaluation.reflectionAndMetacognition}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#726960] italic">채점 대기</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#726960]">
                      {sub.createdAt ? String(sub.createdAt).slice(5, 16) : '방금 전'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => openGradingModal(sub)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#2d2926] hover:bg-[#8b4513] text-white text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{sub.evaluation ? '재평가/수정' : '루브릭 채점'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(sub)}
                          title="해당 학생 제출 기록 삭제"
                          className="p-1 rounded-md text-[#726960] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rubric Evaluation Modal */}
      {evaluatingSub && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f9f7f2] rounded-2xl border border-[#2d2926]/15 max-w-3xl w-full p-6 max-h-[92vh] overflow-y-auto shadow-2xl space-y-5">
            {/* Modal Top */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2926]/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b4513] text-white flex items-center justify-center font-bold text-sm">
                  {evaluatingSub.teamNo}모둠
                </div>
                <div>
                  <h3 className="font-batang font-bold text-lg text-[#2d2926]">
                    {evaluatingSub.name} 학생 루브릭 평가 및 피드백 입력
                  </h3>
                  <p className="text-xs text-[#726960]">
                    {evaluatingSub.gradeClass} {evaluatingSub.studentNo}번
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEvaluatingSub(null)}
                className="text-xs px-2.5 py-1 rounded-lg border border-[#2d2926]/15 text-[#726960] hover:bg-[#f5f2ed]"
              >
                닫기
              </button>
            </div>

            {/* Student's Reflection Content Preview */}
            <div className="p-4 rounded-xl bg-white border border-[#2d2926]/10 space-y-2 text-xs">
              <h4 className="font-bold text-[#2d2926] flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8b4513]" />
                <span>학생 제출 배·느·실 성찰 내용</span>
              </h4>
              <div className="space-y-1.5 text-[#2d2926]/85 leading-relaxed">
                <p>
                  <strong className="text-[#c04000]">[배운 점]: </strong>
                  {evaluatingSub.reflection.learned}
                </p>
                <p>
                  <strong className="text-[#2e5a59]">[느낀 점]: </strong>
                  {evaluatingSub.reflection.felt}
                </p>
                <p>
                  <strong className="text-[#8b4513]">[실생활 연결]: </strong>
                  {evaluatingSub.reflection.connected}
                </p>
              </div>
            </div>

            {/* 4 Rubric Evaluation Criteria Selectors */}
            <div className="space-y-4">
              <h4 className="font-batang font-bold text-sm text-[#2d2926] flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-[#8b4513]" />
                <span>루브릭 4개 영역 성취 등급 부여 (A: 우수 / B: 보통 / C: 노력요함)</span>
              </h4>

              {/* 1. 개념 이해 및 추론 */}
              <div className="p-3 rounded-xl bg-white border border-[#2d2926]/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#c04000]">
                    1. 개념 이해 및 추론 (원의 현의 수직이등분선 성질)
                  </span>
                  <div className="flex space-x-1">
                    {(['A', 'B', 'C'] as RubricGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setConceptGrade(g)}
                        className={`w-7 h-7 rounded-md font-bold text-xs transition-colors border ${
                          conceptGrade === g
                            ? 'bg-[#c04000] text-white border-[#c04000]'
                            : 'bg-white text-[#2d2926]/70 border-[#2d2926]/15'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#726960]">
                  {conceptGrade === 'A' &&
                    'A: 현의 수직이등분선 위의 점과 현 양 끝점 거리의 동등성을 원의 정의와 결합해 논리적으로 정당화함.'}
                  {conceptGrade === 'B' &&
                    'B: 현의 수직이등분선이 중심을 지남을 알지만 수학적 정당화 설명이 다소 불완전함.'}
                  {conceptGrade === 'C' &&
                    'C: 작도 결과만 단순히 나열하고 수학적 원리에 대한 이해와 설명이 미흡함.'}
                </p>
              </div>

              {/* 2. 문제 해결 및 삶과의 연결 */}
              <div className="p-3 rounded-xl bg-white border border-[#2d2926]/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2e5a59]">
                    2. 문제 해결 및 삶과의 연결 (피타고라스 계산 및 실생활 적용)
                  </span>
                  <div className="flex space-x-1">
                    {(['A', 'B', 'C'] as RubricGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProblemGrade(g)}
                        className={`w-7 h-7 rounded-md font-bold text-xs transition-colors border ${
                          problemGrade === g
                            ? 'bg-[#2e5a59] text-white border-[#2e5a59]'
                            : 'bg-white text-[#2d2926]/70 border-[#2d2926]/15'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#726960]">
                  {problemGrade === 'A' &&
                    'A: 피타고라스 정리를 올바르게 적용해 수막새 반지름(10cm)을 구하고 문화재/실생활 응용이 구체적임.'}
                  {problemGrade === 'B' &&
                    'B: 계산은 맞았으나 실생활 연결 사례의 구체성이 다소 부족함.'}
                  {problemGrade === 'C' &&
                    'C: 계산 오류가 있거나 실생활과의 연결점을 제시하지 못함.'}
                </p>
              </div>

              {/* 3. 의사소통 및 협업 */}
              <div className="p-3 rounded-xl bg-white border border-[#2d2926]/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8b4513]">
                    3. 의사소통 및 협업 (모둠 역할 및 수학적 기호 표현)
                  </span>
                  <div className="flex space-x-1">
                    {(['A', 'B', 'C'] as RubricGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setCommGrade(g)}
                        className={`w-7 h-7 rounded-md font-bold text-xs transition-colors border ${
                          commGrade === g
                            ? 'bg-[#8b4513] text-white border-[#8b4513]'
                            : 'bg-white text-[#2d2926]/70 border-[#2d2926]/15'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#726960]">
                  {commGrade === 'A' &&
                    'A: 수학적 기호와 용어를 명확하게 구사하고 모둠 탐구에 적극적으로 기여함.'}
                  {commGrade === 'B' &&
                    'B: 수학적 표현을 사용했으나 일부 기호나 서술이 모호함.'}
                  {commGrade === 'C' &&
                    'C: 수학적 표현이 결여되었거나 모둠 협력 태도가 소극적임.'}
                </p>
              </div>

              {/* 4. 성찰 및 메타인지 */}
              <div className="p-3 rounded-xl bg-white border border-[#2d2926]/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2d2926]">
                    4. 성찰 및 메타인지 (배·느·실 성찰의 깊이)
                  </span>
                  <div className="flex space-x-1">
                    {(['A', 'B', 'C'] as RubricGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setReflectionGrade(g)}
                        className={`w-7 h-7 rounded-md font-bold text-xs transition-colors border ${
                          reflectionGrade === g
                            ? 'bg-[#2d2926] text-white border-[#2d2926]'
                            : 'bg-white text-[#2d2926]/70 border-[#2d2926]/15'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-[#726960]">
                  {reflectionGrade === 'A' &&
                    'A: 유물 복원과 수학의 융합 가치에 대해 깊이 있게 성찰하고 주도적인 호기심을 기술함.'}
                  {reflectionGrade === 'B' &&
                    'B: 활동 소감을 기술하였으나 형식적인 기술에 머무름.'}
                  {reflectionGrade === 'C' &&
                    'C: 성찰 내용이 단편적이거나 참여 의도가 불성실함.'}
                </p>
              </div>
            </div>

            {/* Teacher Feedback Textarea */}
            <div>
              <label className="block text-xs font-bold text-[#2d2926] mb-1.5 flex items-center justify-between">
                <span>교사 맞춤형 피드백 코멘트</span>
                <span className="text-[11px] text-[#726960] font-normal">
                  학생 화면 및 학급 현황판에 실시간 반영됩니다.
                </span>
              </label>

              {/* Quick praise templates */}
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  '현의 수직이등분선 성질을 수학적으로 완벽히 정당화했습니다.',
                  '유물 복원과 피타고라스 정리 계산을 논리적으로 잘 해결했습니다.',
                  '실생활 연결점 서술이 매우 창의적이고 참신합니다.',
                  '모둠원들과의 원활한 소통과 협업 태도가 훌륭합니다.',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setFeedbackText((prev) => (prev ? `${prev} ${preset}` : preset))
                    }
                    className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-[#f5f2ed] text-[#726960] border border-[#2d2926]/15 transition-colors"
                  >
                    + {preset.slice(0, 16)}...
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="학생에게 전할 칭찬과 보완 피드백을 작성하세요..."
                className="w-full p-3 rounded-xl border border-[#2d2926]/15 bg-white text-xs sm:text-sm text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/25 leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#2d2926]/10 flex items-center justify-between">
              {saveSuccess ? (
                <div className="flex items-center space-x-1 text-[#2e5a59] font-bold text-xs">
                  <Check className="w-4 h-4 text-[#2e5a59]" />
                  <span>Firestore에 평가가 성공적으로 저장되었습니다!</span>
                </div>
              ) : (
                <div className="text-[11px] text-[#726960]">
                  평가 저장 시 학생 대시보드에 즉시 동기화됩니다.
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingSub(null)}
                  className="px-4 py-2 rounded-xl border border-[#2d2926]/15 text-xs font-medium text-[#726960] hover:bg-[#f5f2ed]"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={savingEval}
                  onClick={handleSaveEvaluation}
                  className="px-6 py-2 rounded-xl bg-[#8b4513] hover:bg-[#703810] text-[#f5f2ed] text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {savingEval ? (
                    <span>저장 중...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Firestore에 평가 저장</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Batch Deletion Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f9f7f2] rounded-2xl border border-rose-300 max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                if (!deletingClass) {
                  setShowDeleteConfirmModal(false);
                  setDeleteStatusMsg(null);
                }
              }}
              disabled={deletingClass}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#726960] hover:text-[#2d2926] hover:bg-[#f5f2ed] disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-batang font-bold text-lg text-[#2d2926]">
                  학급 데이터 전체 삭제 확인
                </h3>
                <p className="text-xs text-[#726960]">
                  {deleteTargetClass === 'ALL'
                    ? '전체 학급 제출 데이터 삭제'
                    : `${deleteTargetClass}반 학생 제출 데이터 삭제`}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
              <p className="font-semibold text-rose-950">
                정말로 {deleteTargetClass === 'ALL' ? (
                  <strong className="underline text-rose-700">전체 등록된 모든 학급</strong>
                ) : (
                  <strong className="underline text-rose-700">{deleteTargetClass}반</strong>
                )}의 학생 제출 데이터를 모두 영구 삭제하시겠습니까?
              </p>
              <p className="text-[11px] leading-relaxed text-rose-800">
                • 삭제 대상 제출 건수: <strong>{classSubmissions.length}건</strong><br />
                • 주의: 삭제된 데이터는 Firestore 클라우드 데이터베이스 및 관리실에서 영구히 제거되며 복구할 수 없습니다.
              </p>
            </div>

            {deleteStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  deleteStatusMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {deleteStatusMsg.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{deleteStatusMsg.text}</span>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setDeleteStatusMsg(null);
                }}
                disabled={deletingClass}
                className="flex-1 py-2.5 rounded-xl border border-[#2d2926]/20 text-xs font-medium text-[#726960] hover:bg-[#f5f2ed] disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteClass}
                disabled={deletingClass || classSubmissions.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {deletingClass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>삭제 진행 중...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>영구 삭제 실행</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Student Submission Registration Modal */}
      {showManualAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f9f7f2] rounded-2xl border border-[#2d2926]/15 max-w-lg w-full p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setShowManualAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#726960] hover:text-[#2d2926] hover:bg-[#f5f2ed]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-[#8b4513]">
              <PlusCircle className="w-5 h-5" />
              <h3 className="font-batang font-bold text-base text-[#2d2926]">
                학생 제출 데이터 직접 등록
              </h3>
            </div>

            <p className="text-xs text-[#726960] leading-relaxed">
              학생이 스마트폰/태블릿으로 제출했거나 로컬 모드에서 교사 PC로 전송되지 않았을 때, 제출 내역을 관리실에 즉시 추가하여 루브릭 평가 및 통계에 반영할 수 있습니다.
            </p>

            {manualAddSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>학생 제출 내역이 성공적으로 등록되었습니다!</span>
              </div>
            )}

            {/* Quick Import via Code */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                <span>💡 학생이 보내준 [제출 코드]로 자동 채우기</span>
                <span className="text-[10px] font-normal text-amber-800">
                  (코드가 없다면 아래에 이름만 입력하셔도 됩니다)
                </span>
              </div>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  placeholder="학생 화면에서 복사한 코드 붙여넣기..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-[#2d2926] font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleImportCode}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
                >
                  불러오기
                </button>
              </div>
              {codeImportMsg && (
                <p className="text-[11px] font-medium text-amber-900 pt-0.5">
                  {codeImportMsg}
                </p>
              )}
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                    학급
                  </label>
                  <select
                    value={manualGradeClass}
                    onChange={(e) => setManualGradeClass(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#2d2926]/20 bg-white text-xs text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                  >
                    {['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9'].map((c) => (
                      <option key={c} value={c}>{c}반</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                    번호
                  </label>
                  <input
                    type="text"
                    value={manualStudentNo}
                    onChange={(e) => setManualStudentNo(e.target.value)}
                    placeholder="예: 05"
                    className="w-full px-2.5 py-2 rounded-lg border border-[#2d2926]/20 bg-white text-xs text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                    모둠
                  </label>
                  <select
                    value={manualTeamNo}
                    onChange={(e) => setManualTeamNo(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#2d2926]/20 bg-white text-xs text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
                      <option key={t} value={t}>{t}모둠</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                  학생 이름 <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="예: 이지호"
                  className="w-full px-3 py-2 rounded-lg border border-[#2d2926]/20 bg-white text-xs text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/70 p-3 rounded-xl border border-[#2d2926]/10">
                <label className="flex items-center space-x-2 text-xs font-medium text-[#2d2926] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualIsRestored}
                    onChange={(e) => setManualIsRestored(e.target.checked)}
                    className="w-4 h-4 rounded text-[#8b4513] focus:ring-[#8b4513]"
                  />
                  <span>수막새 작도 복원 완료 (250, 250)</span>
                </label>
                <div>
                  <div className="text-[11px] text-[#726960] mb-0.5">피타고라스 계산 답(cm)</div>
                  <input
                    type="text"
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                    placeholder="10"
                    className="w-full px-2 py-1 rounded border border-[#2d2926]/20 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                  수학적 개념·원리 (배운 점)
                </label>
                <textarea
                  rows={2}
                  value={manualLearned}
                  onChange={(e) => setManualLearned(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#2d2926]/20 bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                  모둠 협력·소통 (느낀 점)
                </label>
                <textarea
                  rows={2}
                  value={manualFelt}
                  onChange={(e) => setManualFelt(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#2d2926]/20 bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d2926] mb-1">
                  실생활 및 문화재 연결점
                </label>
                <textarea
                  rows={2}
                  value={manualConnected}
                  onChange={(e) => setManualConnected(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#2d2926]/20 bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-[#2d2926]/10">
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#2d2926]/20 text-xs font-medium text-[#726960] hover:bg-[#f5f2ed]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={manualAddLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#8b4513] hover:bg-[#703810] text-xs font-bold text-white shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {manualAddLoading ? (
                    <span>등록 중...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>대시보드에 즉시 등록</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
