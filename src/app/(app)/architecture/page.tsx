import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture — VibeShift",
};

export default function ArchitecturePage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-100">System Architecture</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          VibeShift system design · Agent workflow · CI/CD integration
        </p>
      </div>

      {/* System Architecture SVG */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-slate-300 mb-5">1. System Architecture</h2>
        <svg viewBox="0 0 900 480" className="w-full max-w-4xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#4a5568" />
            </marker>
            <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
            </marker>
            <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
          </defs>

          {/* GitHub */}
          <rect x="20" y="190" width="130" height="60" rx="10" fill="#161625" stroke="#2a2a3e" strokeWidth="1.5"/>
          <text x="85" y="216" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">GitHub</text>
          <text x="85" y="234" textAnchor="middle" fill="#64748b" fontSize="10">PR Event</text>
          <text x="85" y="246" textAnchor="middle" fill="#64748b" fontSize="10">Webhook</text>

          {/* Arrow GitHub → API */}
          <line x1="150" y1="220" x2="210" y2="220" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowBlue)" strokeDasharray="5,3"/>
          <text x="180" y="214" textAnchor="middle" fill="#6366f1" fontSize="9">POST</text>

          {/* VibeShift API */}
          <rect x="210" y="170" width="140" height="100" rx="10" fill="#0f1932" stroke="#6366f1" strokeWidth="1.5"/>
          <text x="280" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">VibeShift API</text>
          <text x="280" y="222" textAnchor="middle" fill="#64748b" fontSize="10">Next.js App Router</text>
          <text x="280" y="238" textAnchor="middle" fill="#64748b" fontSize="10">/api/analyze/[id]</text>
          <text x="280" y="254" textAnchor="middle" fill="#64748b" fontSize="10">GitHub OAuth</text>

          {/* Arrow API → Orchestrator */}
          <line x1="350" y1="220" x2="420" y2="220" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#arrowBlue)"/>

          {/* Orchestrator */}
          <rect x="420" y="170" width="140" height="100" rx="10" fill="#1a0f32" stroke="#8b5cf6" strokeWidth="1.5"/>
          <text x="490" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">IBM Bob</text>
          <text x="490" y="222" textAnchor="middle" fill="#8b5cf6" fontSize="10">Orchestrator</text>
          <text x="490" y="238" textAnchor="middle" fill="#64748b" fontSize="10">Project DNA</text>
          <text x="490" y="254" textAnchor="middle" fill="#64748b" fontSize="10">Rule Graph</text>

          {/* Arrow Orchestrator → Agents (fan out) */}
          <line x1="560" y1="190" x2="620" y2="100" stroke="#8b5cf6" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <line x1="560" y1="205" x2="620" y2="185" stroke="#8b5cf6" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <line x1="560" y1="235" x2="620" y2="255" stroke="#8b5cf6" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <line x1="560" y1="250" x2="620" y2="335" stroke="#8b5cf6" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <text x="590" y="222" textAnchor="middle" fill="#8b5cf6" fontSize="9">parallel</text>

          {/* 4 Agent boxes */}
          {[
            { y: 70, label: "Pattern Drift", sub: "Architecture rules", color: "#f59e0b" },
            { y: 155, label: "Security Sentinel", sub: "OWASP / CWE", color: "#ef4444" },
            { y: 225, label: "Dependency Guardian", sub: "npm registry", color: "#3b82f6" },
            { y: 305, label: "Test Gap Finder", sub: "Coverage check", color: "#8b5cf6" },
          ].map((agent, i) => (
            <g key={i}>
              <rect x="620" y={agent.y} width="130" height="55" rx="8" fill="#0f0f1a" stroke={agent.color} strokeWidth="1" strokeOpacity="0.6"/>
              <text x="685" y={agent.y + 22} textAnchor="middle" fill={agent.color} fontSize="11" fontWeight="600">{agent.label}</text>
              <text x="685" y={agent.y + 38} textAnchor="middle" fill="#64748b" fontSize="10">{agent.sub}</text>
              <text x="685" y={agent.y + 50} textAnchor="middle" fill="#4a5568" fontSize="9">Granite AI</text>
            </g>
          ))}

          {/* Agents → Decision (fan in) */}
          <line x1="750" y1="97" x2="810" y2="197" stroke="#4a5568" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <line x1="750" y1="182" x2="810" y2="207" stroke="#4a5568" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <line x1="750" y1="252" x2="810" y2="222" stroke="#4a5568" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>
          <line x1="750" y1="332" x2="810" y2="232" stroke="#4a5568" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4,2"/>

          {/* Decision Engine */}
          <rect x="810" y="175" width="70" height="70" rx="10" fill="#0f1a0f" stroke="#10b981" strokeWidth="1.5"/>
          <text x="845" y="205" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="600">Score</text>
          <text x="845" y="220" textAnchor="middle" fill="#10b981" fontSize="11">Engine</text>
          <text x="845" y="236" textAnchor="middle" fill="#64748b" fontSize="10">GO/NO-GO</text>

          {/* Score → GitHub back */}
          <path d="M 845 245 Q 845 420 85 420 Q 85 260 85 250" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowGreen)"/>
          <text x="460" y="440" textAnchor="middle" fill="#10b981" fontSize="10">Post PR comment + Update status check + Block/Allow merge</text>

          {/* Labels */}
          <text x="450" y="30" textAnchor="middle" fill="#64748b" fontSize="11" fontStyle="italic">VibeShift — AI Code Integrity Gate — System Architecture</text>
        </svg>
      </div>

      {/* Agent Workflow SVG */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-slate-300 mb-5">2. Agent Workflow</h2>
        <svg viewBox="0 0 820 200" className="w-full max-w-3xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="a2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
            </marker>
          </defs>

          {[
            { x: 20, label: "PR Opened", sub: "GitHub webhook", color: "#6366f1" },
            { x: 140, label: "DNA Extract", sub: "ARCH + CONTRIBUTING", color: "#8b5cf6" },
            { x: 260, label: "4 Agents Spawn", sub: "Parallel execution", color: "#f59e0b" },
            { x: 380, label: "Results Merge", sub: "Score calculation", color: "#3b82f6" },
            { x: 500, label: "Auto-Fix Gen", sub: "IBM Bob + Granite", color: "#10b981" },
            { x: 620, label: "GO / NO-GO", sub: "Decision output", color: "#ef4444" },
            { x: 700, label: "GitHub Update", sub: "Comment + Status", color: "#10b981" },
          ].map((step, i) => (
            <g key={i}>
              <circle cx={step.x + 55} cy="80" r="28" fill="#0f0f1a" stroke={step.color} strokeWidth="1.5"/>
              <text x={step.x + 55} y="76" textAnchor="middle" fill={step.color} fontSize="11" fontWeight="700">{i + 1}</text>
              <text x={step.x + 55} y="120" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">{step.label}</text>
              <text x={step.x + 55} y="136" textAnchor="middle" fill="#64748b" fontSize="9">{step.sub}</text>
              {i < 6 && (
                <line
                  x1={step.x + 83}
                  y1="80"
                  x2={step.x + 112}
                  y2="80"
                  stroke="#2a2a3e"
                  strokeWidth="1.5"
                  markerEnd="url(#a2)"
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* CI/CD Flow SVG */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-slate-300 mb-5">3. CI/CD Integration Flow</h2>
        <svg viewBox="0 0 860 320" className="w-full max-w-4xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="a3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#4a5568" />
            </marker>
          </defs>

          {/* Dev */}
          <rect x="10" y="130" width="90" height="50" rx="8" fill="#161625" stroke="#2a2a3e" strokeWidth="1"/>
          <text x="55" y="152" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">Developer</text>
          <text x="55" y="168" textAnchor="middle" fill="#64748b" fontSize="10">git push</text>

          <line x1="100" y1="155" x2="140" y2="155" stroke="#4a5568" strokeWidth="1.5" markerEnd="url(#a3)"/>

          {/* GitHub */}
          <rect x="140" y="120" width="100" height="70" rx="8" fill="#161625" stroke="#2a2a3e" strokeWidth="1"/>
          <text x="190" y="148" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">GitHub</text>
          <text x="190" y="163" textAnchor="middle" fill="#64748b" fontSize="10">PR Created</text>
          <text x="190" y="178" textAnchor="middle" fill="#6366f1" fontSize="10">Webhook →</text>

          <line x1="240" y1="155" x2="280" y2="155" stroke="#4a5568" strokeWidth="1.5" markerEnd="url(#a3)"/>

          {/* GitHub Action */}
          <rect x="280" y="105" width="120" height="100" rx="8" fill="#0f1932" stroke="#6366f1" strokeWidth="1.5"/>
          <text x="340" y="133" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">GitHub Action</text>
          <text x="340" y="150" textAnchor="middle" fill="#64748b" fontSize="10">vibeshift.yml</text>
          <text x="340" y="166" textAnchor="middle" fill="#64748b" fontSize="10">Triggers on:</text>
          <text x="340" y="180" textAnchor="middle" fill="#6366f1" fontSize="9">pull_request:</text>
          <text x="340" y="193" textAnchor="middle" fill="#6366f1" fontSize="9">opened, synchronize</text>

          <line x1="400" y1="155" x2="440" y2="155" stroke="#4a5568" strokeWidth="1.5" markerEnd="url(#a3)"/>

          {/* VibeShift */}
          <rect x="440" y="105" width="120" height="100" rx="8" fill="#1a0f32" stroke="#8b5cf6" strokeWidth="1.5"/>
          <text x="500" y="133" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">VibeShift</text>
          <text x="500" y="150" textAnchor="middle" fill="#8b5cf6" fontSize="10">IBM Bob 2.0</text>
          <text x="500" y="166" textAnchor="middle" fill="#64748b" fontSize="10">4 Agents</text>
          <text x="500" y="180" textAnchor="middle" fill="#64748b" fontSize="10">Score Engine</text>
          <text x="500" y="194" textAnchor="middle" fill="#64748b" fontSize="10">Auto-Fix Gen</text>

          {/* Decision branch */}
          <line x1="560" y1="145" x2="610" y2="100" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#a3)"/>
          <line x1="560" y1="165" x2="610" y2="215" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#a3)"/>

          {/* GO path */}
          <rect x="610" y="65" width="100" height="55" rx="8" fill="#0f1a0f" stroke="#10b981" strokeWidth="1.5"/>
          <text x="660" y="89" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">✓ GO</text>
          <text x="660" y="105" textAnchor="middle" fill="#64748b" fontSize="10">Score ≥ 70</text>
          <text x="660" y="117" textAnchor="middle" fill="#64748b" fontSize="10">Merge allowed</text>

          {/* NO-GO path */}
          <rect x="610" y="190" width="100" height="55" rx="8" fill="#1a0f0f" stroke="#ef4444" strokeWidth="1.5"/>
          <text x="660" y="214" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">✗ NO-GO</text>
          <text x="660" y="230" textAnchor="middle" fill="#64748b" fontSize="10">Score &lt; 70</text>
          <text x="660" y="242" textAnchor="middle" fill="#64748b" fontSize="10">Merge blocked</text>

          <line x1="710" y1="92" x2="760" y2="92" stroke="#10b981" strokeWidth="1" markerEnd="url(#a3)"/>
          <line x1="710" y1="217" x2="760" y2="217" stroke="#ef4444" strokeWidth="1" markerEnd="url(#a3)"/>

          {/* Outcomes */}
          <rect x="760" y="65" width="90" height="55" rx="8" fill="#161625" stroke="#10b981" strokeWidth="1"/>
          <text x="805" y="86" textAnchor="middle" fill="#10b981" fontSize="10">PR Merged</text>
          <text x="805" y="100" textAnchor="middle" fill="#64748b" fontSize="9">Status: ✓</text>
          <text x="805" y="113" textAnchor="middle" fill="#64748b" fontSize="9">Comment posted</text>

          <rect x="760" y="190" width="90" height="55" rx="8" fill="#161625" stroke="#ef4444" strokeWidth="1"/>
          <text x="805" y="211" textAnchor="middle" fill="#ef4444" fontSize="10">PR Blocked</text>
          <text x="805" y="225" textAnchor="middle" fill="#64748b" fontSize="9">Status: ✗</text>
          <text x="805" y="238" textAnchor="middle" fill="#64748b" fontSize="9">Fixes suggested</text>

          <text x="430" y="290" textAnchor="middle" fill="#4a5568" fontSize="10" fontStyle="italic">VibeShift CI/CD Integration — .github/workflows/vibeshift.yml</text>
        </svg>
      </div>
    </div>
  );
}

