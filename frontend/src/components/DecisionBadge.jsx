const DECISION_CONFIG = {
  "Execute silently": {
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    description: "High confidence, low risk. alfred_ will proceed without interruption."
  },
  "Execute and tell the user after": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Proceeding with caution. The user will be notified of the outcome."
  },
  "Confirm before executing": {
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    description: "Ambiguity or moderate risk detected. Explicit user consent required."
  },
  "Ask a clarifying question": {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Missing critical information. alfred_ cannot proceed yet."
  },
  "Refuse / escalate": {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    description: "Action violates policy or risk is too high. Manual intervention required."
  },
  "System Error": {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    description: "The decision engine encountered a technical failure. Defaulting to safe state (No Execution)."
  }
};

export default function DecisionBadge({ decision, rationale }) {
  if (!decision) {
    return (
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
        <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.31a2 2 0 01-1.332.138l-2.082-.416a2 2 0 01-1.428-1.428l-.416-2.082a2 2 0 01.138-1.332l.31-.691a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022L12 3l1.572 1.572a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.691-.31a2 2 0 011.332-.138l2.082.416a2 2 0 011.428 1.428l.416 2.082a2 2 0 01-.138 1.332l-.31.691a6 6 0 00-.517 3.86l.477 2.387a2 2 0 00.547 1.022L12 21l-1.572-1.572z" />
        </svg>
        <p className="font-medium">Ready for evaluation</p>
      </div>
    );
  }

  const config = DECISION_CONFIG[decision] || {
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: null,
    description: "Unknown decision state."
  };

  return (
    <div className={`p-6 rounded-2xl shadow-sm border-2 transition-all animate-in fade-in slide-in-from-top-4 duration-500 ${config.bg} ${config.border} ${config.color}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-white shadow-sm ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-xs uppercase tracking-widest opacity-70">Decision</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 border border-current/20 font-bold uppercase">Rules-Based</span>
          </div>
          <p className="text-3xl font-black mb-1 tracking-tight">{decision}</p>
          <p className="text-sm font-medium opacity-80 mb-4">{config.description}</p>
          
          <div className="bg-white/40 p-4 rounded-xl border border-current/10">
            <p className="text-xs font-bold uppercase mb-1 opacity-60">Reasoning</p>
            <p className="text-lg font-medium leading-tight">"{rationale}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
