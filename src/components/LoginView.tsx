import React, { useState } from 'react';
import type { StudentInfo } from '../types';
import {
  Users,
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onLogin: (student: StudentInfo) => void;
  onGoToTeacher: () => void;
}

export const LoginView: React.FC<Props> = ({ onLogin, onGoToTeacher }) => {
  const [gradeClass, setGradeClass] = useState('3-1');
  const [studentNo, setStudentNo] = useState('');
  const [teamNo, setTeamNo] = useState<number>(1);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const teams = [
    { no: 1, name: '1모둠 (청룡)', color: 'bg-[#2e5a59] text-[#f5f2ed] border-[#20403f]' },
    { no: 2, name: '2모둠 (백호)', color: 'bg-[#5c544d] text-[#f5f2ed] border-[#47413b]' },
    { no: 3, name: '3모둠 (주작)', color: 'bg-[#8b4513] text-[#f5f2ed] border-[#70370e]' },
    { no: 4, name: '4모둠 (현무)', color: 'bg-[#2d2926] text-[#f5f2ed] border-[#1d1a18]' },
    { no: 5, name: '5모둠 (황룡)', color: 'bg-[#a06d28] text-[#f5f2ed] border-[#80571f]' },
    { no: 6, name: '6모둠 (기린)', color: 'bg-[#6e5849] text-[#f5f2ed] border-[#574539]' },
  ];

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeClass.trim()) {
      setError('학급(반)을 입력하거나 선택해 주세요.');
      return;
    }
    if (!studentNo.trim()) {
      setError('출석번호를 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setError('학생 이름을 입력해 주세요.');
      return;
    }

    setError('');
    onLogin({
      gradeClass: gradeClass.trim(),
      studentNo: studentNo.trim().padStart(2, '0'),
      teamNo,
      name: name.trim(),
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 bg-[#f5f2ed]">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-[#f9f7f2] rounded-2xl border border-[#2d2926]/15 shadow-xl overflow-hidden">
          {/* Top Traditional Motif Banner */}
          <div className="bg-[#2d2926] text-[#f5f2ed] px-6 py-6 sm:py-8 text-center relative border-b-4 border-[#8b4513]">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3d3732] text-[#e6c170] text-xs font-medium mb-3 border border-[#524a43]">
              <Sparkles className="w-3.5 h-3.5 text-[#e6c170]" />
              <span>중학교 3학년 수학 | 원과 현의 성질 융합 탐구</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-batang font-bold tracking-tight text-[#f5f2ed] mb-2">
              수막새 복원 수학 탐구실
            </h2>
            <p className="text-xs sm:text-sm text-[#e6c170]/80 max-w-lg mx-auto leading-relaxed">
              깨진 삼국시대 연화문 수막새 조각의 원형을 기하학적 작도와 피타고라스 정리로 복원해 봅시다.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#2d2926]/10 pb-4">
              <h3 className="font-batang font-bold text-lg text-[#2d2926] flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#8b4513]" />
                <span>학생 탐구자 정보 입력</span>
              </h3>
              <p className="text-xs text-[#726960] mt-1">
                로그인 없이 학급, 번호, 모둠, 이름을 입력하면 바로 실습을 시작할 수 있습니다.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#8b4513]/10 border border-[#8b4513]/25 text-[#8b4513] text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grade and Class */}
                <div>
                  <label className="block text-xs font-semibold text-[#2d2926] mb-1.5">
                    학급 (학년-반)
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={gradeClass}
                      onChange={(e) => setGradeClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d2926]/20 bg-white text-sm text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                    >
                      {['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9'].map(
                        (cls) => (
                          <option key={cls} value={cls}>
                            {cls}반
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <p className="mt-1 text-[11px] text-[#726960]">
                    * 본인 학급을 선택하세요.
                  </p>
                </div>

                {/* Attendance Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#2d2926] mb-1.5">
                    출석번호
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={studentNo}
                    onChange={(e) => setStudentNo(e.target.value)}
                    placeholder="예: 07 또는 15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d2926]/20 bg-white text-sm text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                  />
                  <p className="mt-1 text-[11px] text-[#726960]">
                    * 1번 ~ 45번 중 본인 번호 입력
                  </p>
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2d2926] mb-1.5">
                  학생 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d2926]/20 bg-white text-sm text-[#2d2926] focus:outline-none focus:ring-2 focus:ring-[#8b4513]/30"
                />
              </div>

              {/* Team Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#2d2926] mb-1.5">
                  소속 모둠 (1~6모둠)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {teams.map((t) => (
                    <button
                      key={t.no}
                      type="button"
                      onClick={() => setTeamNo(t.no)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between cursor-pointer ${
                        teamNo === t.no
                          ? `${t.color} shadow-sm ring-2 ring-offset-1 ring-[#8b4513]`
                          : 'bg-white border-[#2d2926]/15 text-[#2d2926] hover:bg-[#f5f2ed]'
                      }`}
                    >
                      <span>{t.name}</span>
                      {teamNo === t.no && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white ml-1 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#8b4513] hover:bg-[#72380f] text-[#f5f2ed] font-medium text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                <span>수막새 디지털 복원 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider & Teacher Entrance */}
            <div className="mt-8 pt-6 border-t border-[#2d2926]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#726960]">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-[#8b4513]" />
                <span>심사위원/교사이신가요? 비밀번호 없이 관리실로 즉시 입장 가능합니다.</span>
              </div>
              <button
                type="button"
                onClick={onGoToTeacher}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#8b4513]/40 bg-[#8b4513]/10 hover:bg-[#8b4513] text-[#8b4513] hover:text-white transition-all cursor-pointer font-bold shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>교사 관리실 바로 입장</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
