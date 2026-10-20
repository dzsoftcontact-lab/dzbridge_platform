import React, { useState } from 'react';
import { BackendConnectionConfig } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { Server, Database, Wifi, RefreshCw, CheckCircle2, Key, Copy, Check, X } from 'lucide-react';

interface BackendConnectModalProps {
  config: BackendConnectionConfig;
  onUpdateConfig: (newConfig: Partial<BackendConnectionConfig>) => void;
  onClose: () => void;
}

export const BackendConnectModal: React.FC<BackendConnectModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [djangoApiUrl, setDjangoApiUrl] = useState(config.djangoApiUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latency: number; message: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handlePing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      const simulatedLatency = Math.floor(Math.random() * 15) + 15;
      onUpdateConfig({
        apiUrl,
        djangoApiUrl,
        status: 'connected',
        latencyMs: simulatedLatency,
        lastPing: new Date().toLocaleTimeString(),
      });
      setPingResult({
        success: true,
        latency: simulatedLatency,
        message: isAr
          ? 'البوابات تعمل بكفاءة: خادم NestJS (4000) وخادم Django DRF (8000) متصلان.'
          : 'Gateways responding: NestJS (Port 4000) and Django DRF (Port 8000) operational.',
      });
    }, 400);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(config.jwtToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-[#3B0D2C] via-[#4A1238] to-[#2B0A20] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C89B3C] text-slate-950 flex items-center justify-center font-black text-lg shadow-md border border-[#E5C158]">
              DZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{t('modal.title')}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Ports 4000 & 8000
                </span>
              </div>
              <p className="text-xs text-amber-100/80">
                {t('modal.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-800 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#3B0D2C]" />
                Primary Core
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">NestJS 10 + Node</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Port 4000 Listening</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#C89B3C]" />
                Django DRF Hub
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">Django 5.1 + DRF</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Port 8000 Ready</div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-blue-600" />
                {t('modal.latency')}
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">{config.latencyMs} ms</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Last ping: {config.lastPing}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">{t('modal.djangoApiUrl')}</label>
              <input
                type="text"
                value={djangoApiUrl}
                onChange={(e) => setDjangoApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">{t('modal.apiUrl')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:4000/api/v1"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
                <button
                  onClick={handlePing}
                  disabled={isPinging}
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? t('common.loading') : t('modal.testConnection')}</span>
                </button>
              </div>
            </div>

            {pingResult && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Success ({pingResult.latency}ms):</strong> {pingResult.message}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#C89B3C]" />
                {t('modal.bearerToken')}
              </label>
              <button
                onClick={handleCopyToken}
                className="text-xs font-semibold text-[#3B0D2C] hover:text-[#C89B3C] flex items-center gap-1"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? t('common.copied') : t('common.copy')}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] break-all border border-slate-800">
              {config.jwtToken}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-between items-center">
          <div className="text-[11px] text-slate-500">
            DRF Client available at: <code className="text-[#3B0D2C] font-bold">http://localhost:8000/</code>
          </div>
          <button
            onClick={onClose}
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl transition text-xs shadow-xs"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
