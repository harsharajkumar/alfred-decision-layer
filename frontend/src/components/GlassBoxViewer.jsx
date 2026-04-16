import { useState } from 'react';

function SignalCard({ label, value, type = 'boolean' }) {
  const isPositive = type === 'boolean' ? value === true : value > 0;
  const colorClass = isPositive ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-gray-400 bg-gray-50 border-gray-100';

  return (
    <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${colorClass}`}>
      <span className="text-[10px] uppercase font-black tracking-tighter opacity-70">{label}</span>
      <span className="text-sm font-bold">{type === 'boolean' ? (value ? 'YES' : 'NO') : value}</span>
    </div>
  );
}

function RiskMeter({ score }) {
  const getRiskColor = (value) => {
    if (value >= 8) return 'bg-red-500';
    if (value >= 5) return 'bg-orange-500';
    if (value >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex-1">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Contextual Risk</span>
        <span className="text-3xl font-black tabular-nums">{score}<span className="text-sm text-gray-300">/10</span></span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-700 ${i < score ? getRiskColor(score) : 'bg-gray-200 opacity-20'}`}
          />
        ))}
      </div>
    </div>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'No data available.';
  }

  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

function JsonCard({ title, value, tone = 'slate' }) {
  const toneClass = {
    slate: 'bg-gray-900 border-gray-800 text-gray-200',
    blue: 'bg-slate-900 border-slate-800 text-blue-300',
    green: 'bg-slate-900 border-slate-800 text-green-400',
  }[tone];

  return (
    <div className={`rounded-2xl p-4 border ${toneClass}`}>
      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</h4>
      <div className="bg-black/30 rounded-xl p-4 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap h-64 overflow-y-auto border border-white/5">
        <pre>{formatValue(value)}</pre>
      </div>
    </div>
  );
}

function EmptySignalsCard({ errorMessage }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Parsed Signals</span>
      </div>
      <p className="text-sm font-medium text-gray-700">
        No structured signals were produced for this run, so the system fell back to a safe deterministic response.
      </p>
      {errorMessage && (
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          The evaluation step failed before JSON parsing completed, which is why risk, contradiction, and intent fields are unavailable here.
        </p>
      )}
    </div>
  );
}

export default function GlassBoxViewer({
  signals,
  inputs,
  promptSent,
  rawOutput,
  errorMessage,
  errorType,
  finalDecisionPayload,
  shortCircuited,
  hasResult,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!hasResult) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 border-dashed text-center text-gray-400">
        <p className="text-sm font-medium">Run the engine to see the decision details.</p>
      </div>
    );
  }

  if (shortCircuited) {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Decision Details</h3>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl border border-purple-200 text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-purple-900 mb-1">Stopped Before Evaluation</p>
            <p className="text-xs text-purple-700">The rules layer caught missing context before the evaluation step ran. No prompt was sent, and the request stayed in the safest state.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <JsonCard title="Inputs" value={inputs} />
          <JsonCard title="Final Parsed Decision" value={finalDecisionPayload} />
        </div>
      </div>
    );
  }

  const hasSignals = Boolean(signals);
  const readableErrorType = errorType ? errorType.split('_').join(' ') : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Decision Details</h3>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl border border-red-200 text-red-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-red-900 mb-1">Fallback Applied</p>
            <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
            {readableErrorType && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2">{readableErrorType}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasSignals ? <RiskMeter score={signals.contextual_risk_score || 0} /> : <EmptySignalsCard errorMessage={errorMessage} />}

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Safety Signals</span>
          </div>

          {hasSignals ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <SignalCard label="Intent Clear" value={signals.intent_clear} />
                <SignalCard label="Contradiction" value={signals.contradiction_flag} />
              </div>

              {signals.missing_parameters?.length > 0 && (
                <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-[10px] font-bold text-red-400 uppercase">Missing Params</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {signals.missing_parameters.map((parameter) => (
                      <span key={parameter} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-red-200 font-bold text-red-600">{parameter}</span>
                    ))}
                  </div>
                </div>
              )}

              {signals.reasoning && (
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Reasoning</span>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{signals.reasoning}</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fallback Path</span>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                This request failed before structured signal extraction completed, so the backend returned the safest available final decision instead.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          {showAdvanced ? 'Hide Technical Details' : 'Show Technical Details'}
          <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
          <JsonCard title="Inputs" value={inputs} />
          <JsonCard title="Final Parsed Decision" value={finalDecisionPayload} />
          <JsonCard title="Evaluation Prompt" value={promptSent || 'No prompt available.'} tone="blue" />
          <JsonCard title="Raw Response" value={rawOutput || 'No raw response available.'} tone="green" />
        </div>
      )}
    </div>
  );
}
