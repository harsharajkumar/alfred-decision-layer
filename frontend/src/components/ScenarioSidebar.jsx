const TYPE_COLORS = {
  "Clear": "text-green-500 bg-green-50 border-green-100",
  "Ambiguous": "text-amber-500 bg-amber-50 border-amber-100",
  "Adversarial": "text-red-500 bg-red-50 border-red-100",
  "Risky": "text-orange-500 bg-orange-50 border-orange-100",
  "Failure": "text-purple-500 bg-purple-50 border-purple-100"
};

export default function ScenarioSidebar({ scenarios, activeId, onSelect }) {
  return (
    <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-gray-900">alfred_<span className="text-blue-600">eval</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision Layer v1.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <h2 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Test Scenarios</h2>
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
              activeId === s.id 
                ? 'bg-blue-50 border-blue-100 shadow-sm' 
                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border ${TYPE_COLORS[s.type] || 'text-gray-500 bg-gray-50 border-gray-100'}`}>
                {s.type}
              </span>
              {activeId === s.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
            </div>
            <div className={`text-sm font-bold transition-colors ${activeId === s.id ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
              {s.name}
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {s.payload.action_type} • {s.payload.latest_message || 'History only'}
            </p>
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600" />
          <div>
            <p className="text-[10px] font-black text-gray-900">Review Workspace</p>
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-tighter">Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
