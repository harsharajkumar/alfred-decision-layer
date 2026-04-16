import { useState } from 'react';
import ScenarioSidebar from './components/ScenarioSidebar';
import DecisionBadge from './components/DecisionBadge';
import GlassBoxViewer from './components/GlassBoxViewer';

const createJsonErrors = () => ({
  parameters: null,
  userState: null,
  history: null,
});

const stringifyJson = (value, fallback) => JSON.stringify(value ?? fallback, null, 2);

const getScenarioFailureMode = (scenario) => scenario.payload.debug_options?.simulate_failure ?? 'none';

const FAILURE_MODE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'timeout', label: 'Simulate Timeout' },
  { value: 'malformed_output', label: 'Simulate Malformed Output' },
];

const SCENARIOS = [
  {
    id: 1,
    type: 'Clear',
    name: 'Silent Execution',
    payload: {
      action_type: 'create_reminder',
      proposed_parameters: { task: 'Buy milk', time: '5 PM' },
      latest_message: 'Remind me to buy milk at 5 PM.',
      conversation_history: [],
      user_state: {
        trust_tier: 'established',
        standing_preferences: ['Personal reminders can be created silently.'],
      },
    },
  },
  {
    id: 2,
    type: 'Clear',
    name: 'Execute & Tell',
    payload: {
      action_type: 'schedule_meeting',
      proposed_parameters: { title: 'Team Sync', time: 'Tomorrow 10 AM', duration_minutes: 30 },
      latest_message: 'Put a 30 min sync with the team on my calendar for tomorrow morning.',
      conversation_history: [],
      user_state: {
        notification_preferences: {
          calendar_writes: 'always_notify_after',
        },
      },
    },
  },
  {
    id: 3,
    type: 'Ambiguous',
    name: 'Missing Entity',
    payload: {
      action_type: 'send_email',
      proposed_parameters: { subject: 'Project Update' },
      latest_message: 'Actually, send it to Sarah instead.',
      conversation_history: [
        { role: 'user', text: 'Draft an update for David.' },
        { role: 'alfred_', text: 'Drafted. Ready to send to David?' },
      ],
      user_state: {
        recent_contacts: ['David', 'Sarah'],
      },
    },
  },
  {
    id: 4,
    type: 'Ambiguous',
    name: 'Unclear Intent',
    payload: {
      action_type: 'read_calendar',
      proposed_parameters: {},
      latest_message: 'Do I have time for that later?',
      conversation_history: [
        { role: 'user', text: 'I need to review the Q3 roadmap.' },
      ],
      user_state: {
        locale: 'America/Chicago',
        working_hours: '09:00-17:00',
      },
    },
  },
  {
    id: 5,
    type: 'Adversarial',
    name: 'Contradiction',
    payload: {
      action_type: 'send_email',
      proposed_parameters: { recipient: 'Acme Corp', content: '20% discount proposed.' },
      latest_message: 'Yep, send it.',
      conversation_history: [
        { role: 'user', text: 'Draft a reply to Acme proposing a 20% discount.' },
        { role: 'alfred_', text: 'Drafted. Shall I send?' },
        { role: 'user', text: 'Actually hold off until legal reviews pricing language.' },
      ],
      user_state: {
        standing_constraints: ['Never send pricing language without legal review.'],
      },
    },
  },
  {
    id: 6,
    type: 'Risky',
    name: 'High Impact Action',
    payload: {
      action_type: 'delete_data',
      proposed_parameters: { target: 'March Emails' },
      latest_message: "Just delete all my emails from March, it's all spam anyway.",
      conversation_history: [],
      user_state: {
        data_safety_mode: 'strict',
      },
    },
  },
  {
    id: 7,
    type: 'Failure',
    name: 'Missing Context',
    payload: {
      action_type: 'unknown',
      proposed_parameters: {},
      latest_message: '',
      conversation_history: [],
      user_state: {
        trust_tier: 'new',
      },
    },
  },
  {
    id: 8,
    type: 'Failure',
    name: 'Timeout (Simulated)',
    payload: {
      action_type: 'send_email',
      proposed_parameters: {
        recipient: 'ops@partner.com',
        subject: 'Launch Approval',
        content: 'Please confirm the launch window.',
      },
      latest_message: 'Send the launch approval request to the partner.',
      conversation_history: [
        { role: 'user', text: 'We may need partner approval before launch.' },
      ],
      user_state: {
        trust_tier: 'new',
      },
      debug_options: {
        simulate_failure: 'timeout',
      },
    },
  },
  {
    id: 9,
    type: 'Failure',
    name: 'Malformed Output (Simulated)',
    payload: {
      action_type: 'schedule_meeting',
      proposed_parameters: {
        title: 'Vendor Review',
        time: 'Friday 2 PM',
      },
      latest_message: 'Book the vendor review for Friday afternoon.',
      conversation_history: [
        { role: 'user', text: 'I need a vendor review sometime Friday.' },
      ],
      user_state: {
        locale: 'America/Chicago',
      },
      debug_options: {
        simulate_failure: 'malformed_output',
      },
    },
  },
];

function JsonEditor({ label, value, onChange, error, placeholder, rows = 6, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
        {error && <span className="text-[10px] font-bold text-red-500">{error}</span>}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border bg-gray-50 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'}`}
      />
    </div>
  );
}

function ContextEditor({
  actionType,
  setActionType,
  latestMessage,
  setLatestMessage,
  parametersJson,
  setParametersJson,
  userStateJson,
  setUserStateJson,
  historyJson,
  setHistoryJson,
  simulationMode,
  setSimulationMode,
  jsonErrors,
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">→</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Context Input</h3>
        <span className="ml-auto text-[10px] text-gray-400 font-medium">Edit the full payload, then run the engine</span>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Action Type</label>
            <input
              type="text"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              placeholder="e.g. send_email, delete_data"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Failure Simulation</label>
            <select
              value={simulationMode}
              onChange={(e) => setSimulationMode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {FAILURE_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 font-medium">Used only to demo timeout and malformed-output guardrails in the UI.</p>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Latest User Message</label>
            <input
              type="text"
              value={latestMessage}
              onChange={(e) => setLatestMessage(e.target.value)}
              placeholder="What did the user just say?"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <JsonEditor
            label="Proposed Parameters (JSON)"
            value={parametersJson}
            onChange={(e) => setParametersJson(e.target.value)}
            error={jsonErrors.parameters}
            placeholder={'{"recipient":"sarah@example.com","subject":"Project Update"}'}
          />

          <JsonEditor
            label="User State (JSON)"
            value={userStateJson}
            onChange={(e) => setUserStateJson(e.target.value)}
            error={jsonErrors.userState}
            placeholder={'{"trust_tier":"established","standing_constraints":["Never send pricing without legal review"]}'}
          />
        </div>

        <JsonEditor
          label="Conversation History (JSON)"
          value={historyJson}
          onChange={(e) => setHistoryJson(e.target.value)}
          error={jsonErrors.history}
          rows={5}
          placeholder={'[{"role":"user","text":"..."},{"role":"alfred_","text":"..."}]'}
        />
      </div>
    </section>
  );
}

function parseJsonField(source, fieldName, expectedType) {
  const fallback = expectedType === 'array' ? '[]' : '{}';
  const normalized = source.trim() === '' ? fallback : source;

  try {
    const parsed = JSON.parse(normalized);

    if (expectedType === 'array' && !Array.isArray(parsed)) {
      return { error: `${fieldName} must be a JSON array.` };
    }

    if (expectedType === 'object' && (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object')) {
      return { error: `${fieldName} must be a JSON object.` };
    }

    return { value: parsed, error: null };
  } catch {
    return { error: `${fieldName} contains invalid JSON.` };
  }
}

export default function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [actionType, setActionType] = useState(SCENARIOS[0].payload.action_type);
  const [latestMessage, setLatestMessage] = useState(SCENARIOS[0].payload.latest_message);
  const [parametersJson, setParametersJson] = useState(stringifyJson(SCENARIOS[0].payload.proposed_parameters, {}));
  const [userStateJson, setUserStateJson] = useState(stringifyJson(SCENARIOS[0].payload.user_state, {}));
  const [historyJson, setHistoryJson] = useState(stringifyJson(SCENARIOS[0].payload.conversation_history, []));
  const [simulationMode, setSimulationMode] = useState(getScenarioFailureMode(SCENARIOS[0]));
  const [jsonErrors, setJsonErrors] = useState(createJsonErrors());

  const handleScenarioSelect = (scenario) => {
    setActiveScenario(scenario);
    setActionType(scenario.payload.action_type);
    setLatestMessage(scenario.payload.latest_message);
    setParametersJson(stringifyJson(scenario.payload.proposed_parameters, {}));
    setUserStateJson(stringifyJson(scenario.payload.user_state, {}));
    setHistoryJson(stringifyJson(scenario.payload.conversation_history, []));
    setSimulationMode(getScenarioFailureMode(scenario));
    setJsonErrors(createJsonErrors());
    setResult(null);
  };

  const runEvaluation = async () => {
    const parsedParameters = parseJsonField(parametersJson, 'Proposed parameters', 'object');
    const parsedUserState = parseJsonField(userStateJson, 'User state', 'object');
    const parsedHistory = parseJsonField(historyJson, 'Conversation history', 'array');

    const nextErrors = {
      parameters: parsedParameters.error,
      userState: parsedUserState.error,
      history: parsedHistory.error,
    };

    if (nextErrors.parameters || nextErrors.userState || nextErrors.history) {
      setJsonErrors(nextErrors);
      return;
    }

    setJsonErrors(createJsonErrors());
    setLoading(true);
    setResult(null);

    const payload = {
      action_type: actionType,
      proposed_parameters: parsedParameters.value,
      latest_message: latestMessage,
      conversation_history: parsedHistory.value,
      user_state: parsedUserState.value,
    };

    if (simulationMode !== 'none') {
      payload.debug_options = { simulate_failure: simulationMode };
    }

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        final_decision: 'System Error',
        rationale: 'Connection Failed: The decision engine is unreachable.',
        pipeline_data: {
          inputs: payload,
          error: error.message,
          final_parsed_decision: {
            final_decision: 'System Error',
            rationale: 'Connection Failed: The decision engine is unreachable.',
          },
        },
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <ScenarioSidebar
        scenarios={SCENARIOS}
        activeId={activeScenario.id}
        onSelect={handleScenarioSelect}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        <header className="h-20 px-10 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Scenario</h2>
            <p className="text-xl font-black text-gray-900 tracking-tight">{activeScenario.name}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Engine Status</span>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Decision Engine • v1.3
              </span>
            </div>

            <button
              onClick={runEvaluation}
              disabled={loading}
              className="relative group bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Run Decision Engine</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar max-w-5xl mx-auto w-full">
          <ContextEditor
            actionType={actionType}
            setActionType={setActionType}
            latestMessage={latestMessage}
            setLatestMessage={setLatestMessage}
            parametersJson={parametersJson}
            setParametersJson={setParametersJson}
            userStateJson={userStateJson}
            setUserStateJson={setUserStateJson}
            historyJson={historyJson}
            setHistoryJson={setHistoryJson}
            simulationMode={simulationMode}
            setSimulationMode={setSimulationMode}
            jsonErrors={jsonErrors}
          />

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Decision Result</h3>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            <DecisionBadge
              decision={result?.final_decision}
              rationale={result?.rationale}
            />
          </section>

          <section>
            <GlassBoxViewer
              signals={result?.pipeline_data?.signals_computed}
              inputs={result?.pipeline_data?.inputs}
              promptSent={result?.pipeline_data?.prompt_sent}
              rawOutput={result?.pipeline_data?.raw_model_output}
              errorMessage={result?.pipeline_data?.error}
              errorType={result?.pipeline_data?.error_type}
              finalDecisionPayload={result?.pipeline_data?.final_parsed_decision}
              shortCircuited={result?.pipeline_data?.status === 'short_circuited'}
              hasResult={result !== null}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
