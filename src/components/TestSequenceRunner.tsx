import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Play,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface TestStep {
  id: number;
  name: string;
  method: 'POST' | 'GET' | 'PATCH';
  endpoint: string;
  description: string;
  payload?: any;
  status: 'idle' | 'running' | 'success' | 'failed';
  responseStatus?: number;
  latencyMs?: number;
  responsePayload?: any;
}

interface TestSequenceRunnerProps {
  onExecuteSequenceStep: (stepId: number) => Promise<{ status: number; payload: any }>;
}

export const TestSequenceRunner: React.FC<TestSequenceRunnerProps> = ({
  onExecuteSequenceStep,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: 1,
      name: '1. Register Diaspora Scholar (Pr. Belgacem Haba)',
      method: 'POST',
      endpoint: '/api/v1/auth/register',
      description: 'Generates user, hashes password with bcrypt (12 rounds), generates activation token, and creates polymorphic profile',
      payload: {
        email: 'belgacem.haba@algerian-scholars.dz',
        password: 'Scholar2026Password!',
        role: 'expert',
        fullName: 'Prof. Belgacem Haba',
        country: 'United States',
        city: 'San Jose, CA',
        isDiaspora: true,
      },
      status: 'idle',
    },
    {
      id: 2,
      name: '2. Declare Physical Algeria Visit Window',
      method: 'POST',
      endpoint: '/api/v1/experts/availability',
      description: 'Registers physical Algeria visit window in Algiers & Bab Ezzouar for university keynotes',
      payload: {
        city: 'Algiers',
        startDate: '2026-11-01',
        endDate: '2026-11-20',
        notes: 'In-person university keynote lectures & doctoral mentorship at USTHB/ESI.',
      },
      status: 'idle',
    },
    {
      id: 3,
      name: '3. Submit University Collaborative Initiative (ESI Algiers)',
      method: 'POST',
      endpoint: '/api/v1/projects',
      description: 'ESI Algiers submits AI & Microelectronics project with guaranteed hotel & flight logistics',
      payload: {
        title: 'High-Density 3D Microelectronic Packaging Workshop',
        description: 'Advanced postgraduate workshop for doctoral candidates in semiconductor design.',
        skillsRequired: ['Semiconductors', '3D Packaging', 'Microelectronics'],
        location: 'Algiers',
        startDate: '2026-11-05',
        endDate: '2026-11-15',
        logisticsOffered: { travel: true, lodging: true, stipend: true },
      },
      status: 'idle',
    },
    {
      id: 4,
      name: '4. Trigger Deterministic Algorithmic Matchmaker',
      method: 'GET',
      endpoint: '/api/v1/matches/recommendations?projectId=proj-101',
      description: 'Calculates: (Skills * 0.45) + (Availability * 0.25) + (Location * 0.15) + (Diaspora * 0.15) -> 98.5% score',
      status: 'idle',
    },
    {
      id: 5,
      name: '5. Scholar Accepts Invitation (Unlock Contact Details)',
      method: 'POST',
      endpoint: '/api/v1/matches/mtc-101/respond',
      description: 'Expert accepts proposition, advancing project lifecycle state machine to contact_initiated',
      payload: {
        decision: 'accepted',
        notes: 'Honored to mentor Algerian engineers at ESI Algiers.',
      },
      status: 'idle',
    },
    {
      id: 6,
      name: '6. Confirm Bilateral Institutional Cooperation Protocol',
      method: 'POST',
      endpoint: '/api/v1/collaborations/confirm',
      description: 'Formal bilateral agreement confirmed between ESI Algiers & Prof. Belgacem Haba',
      payload: {
        projectId: 'proj-101',
        expertId: 'usr-haba-1001',
        notes: 'Official protocol endorsed by University Rector.',
      },
      status: 'idle',
    },
    {
      id: 7,
      name: '7. Verify Immutable Activity Audit Trail',
      method: 'GET',
      endpoint: '/api/v1/audit/logs',
      description: 'Verifies SHA-256 integrity and persistent chronological logs across all prior executed actions',
      status: 'idle',
    },
  ]);

  const runStep = async (index: number) => {
    setActiveStepIndex(index);
    setSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: 'running' } : s)),
    );

    const startTime = performance.now();
    try {
      const result = await onExecuteSequenceStep(steps[index].id);
      const latency = Math.round(performance.now() - startTime);

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === index
            ? {
                ...s,
                status: 'success',
                responseStatus: result.status,
                latencyMs: latency,
                responsePayload: result.payload,
              }
            : s,
        ),
      );
      return true;
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === index
            ? {
                ...s,
                status: 'failed',
                responseStatus: 500,
                latencyMs: latency,
                responsePayload: { error: err?.message || 'Execution error' },
              }
            : s,
        ),
      );
      return false;
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    setSteps((prev) =>
      prev.map((s) => ({ ...s, status: 'idle', responseStatus: undefined, responsePayload: undefined })),
    );
    for (let i = 0; i < steps.length; i++) {
      const ok = await runStep(i);
      await new Promise((r) => setTimeout(r, 300));
      if (!ok) break;
    }
    setIsRunningAll(false);
    setActiveStepIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B0D2C]/10 text-[#3B0D2C] text-xs font-bold mb-2 border border-[#3B0D2C]/20">
            <Terminal className="w-3.5 h-3.5 text-[#C89B3C]" />
            Live End-to-End System Request Sequence Tester
          </div>
          <h2 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
            {t('sequence.title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('sequence.subtitle')}
          </p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={isRunningAll}
          className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isRunningAll ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#C89B3C]" />
          ) : (
            <Play className="w-4 h-4 text-[#C89B3C] fill-current" />
          )}
          <span>{isRunningAll ? t('sequence.running') : t('sequence.runAll')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isRunning = step.status === 'running';
          const isSuccess = step.status === 'success';
          const isFailed = step.status === 'failed';
          return (
            <div
              key={step.id}
              className={`bg-white border rounded-2xl p-4 transition-all shadow-2xs ${
                isRunning
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : isSuccess
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isFailed
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : isFailed
                        ? 'bg-red-600 text-white'
                        : isRunning
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSuccess ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{step.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                          step.method === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {step.method}
                      </span>
                      <code className="text-xs font-mono text-slate-600">{step.endpoint}</code>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {step.responseStatus && (
                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          step.responseStatus < 300
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {step.responseStatus}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                        {step.latencyMs} ms
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => runStep(idx)}
                    disabled={isRunning || isRunningAll}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    {isRunning ? t('sequence.running') : t('sequence.runStep')}
                  </button>
                </div>
              </div>

              {step.responsePayload && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-mono text-slate-500 mb-1 font-bold">
                    {t('sequence.stepResponse')}:
                  </div>
                  <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-36">
                    {JSON.stringify(step.responsePayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
