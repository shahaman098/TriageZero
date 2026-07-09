import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Bot,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileOutput,
  Flame,
  Gauge,
  GitBranchPlus,
  LockOpen,
  Radar,
  ShieldCheck,
  Sparkles,
  TimerReset,
  WandSparkles,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Mode = "chaos" | "factory" | "launch";
type TaskStatus = "incoming" | "parsed" | "routed" | "resolved";
type AgentState = "idle" | "running" | "blocked" | "ready" | "done";

type Task = {
  source: string;
  raw: string;
  owner: string;
  priority: "P0" | "P1" | "P2";
  refined: string;
  lane: string;
  status: TaskStatus;
};

type AgentLaneState = {
  name: string;
  role: string;
  icon: LucideIcon;
  progress: number;
  state: AgentState;
  note: string;
};

type OutputCard = {
  title: string;
  summary: string;
  heroLine: string;
  pillars: string[];
  checklist: string[];
  finishLabel: string;
};

const baseTasks: Omit<Task, "status">[] = [
  {
    source: "Founder note",
    raw: "Make our demo feel like a real AI ops product, not another generic dashboard.",
    owner: "@sprint-captain",
    priority: "P0",
    refined: "Reframe pitch into a premium orchestration product with one obvious wow moment.",
    lane: "Product framing",
  },
  {
    source: "Judge prompt",
    raw: "Show clear autonomy, oversight, and a final artifact people would actually want to use.",
    owner: "@demo-desk",
    priority: "P1",
    refined: "Convert messy asks into guided agent work, explicit approval, and a board-ready output.",
    lane: "Narrative flow",
  },
  {
    source: "Partner ask",
    raw: "Keep it fast, mobile-first, and dramatic enough for a live recording on iPhone.",
    owner: "@sponsor-thread",
    priority: "P1",
    refined: "Optimize for one-tap orchestration, readable motion, and a polished launch artifact.",
    lane: "Execution plan",
  },
];

const modeMeta: Record<
  Mode,
  {
    eyebrow: string;
    title: string;
    body: string;
    accent: string;
  }
> = {
  chaos: {
    eyebrow: "Unstructured intake",
    title: "Absorb the chaos without losing the plot.",
    body: "TriageZero clusters messy requests, ranks the risk, and converts scattered asks into work the swarm can actually execute.",
    accent: "high-chaos",
  },
  factory: {
    eyebrow: "Autonomous execution",
    title: "Route work through agents with explicit ownership.",
    body: "Factory mode keeps the lanes dense and accountable: each agent gets a narrow brief, a progress contract, and a visible output.",
    accent: "factory-flow",
  },
  launch: {
    eyebrow: "Ship-ready narrative",
    title: "Turn production state into something you can present.",
    body: "Launch mode biases toward a clean finish: tighter copy, safer approvals, and a final artifact that reads clearly in a two-minute demo.",
    accent: "launch-polish",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function describeStatus(
  tick: number,
  isDeployed: boolean,
  requiresApproval: boolean,
  isApproved: boolean,
  isComplete: boolean,
  mode: Mode,
) {
  if (!isDeployed) {
    return {
      label: "System idle",
      body: `Ready to ingest unstructured asks in ${mode} mode. No work has been routed yet.`,
    };
  }

  if (isComplete) {
    return {
      label: "Artifact ready",
      body: "Swarm finished orchestration, safety posture is accounted for, and the final launch pack is ready to present.",
    };
  }

  if (requiresApproval && !isApproved && tick >= 4) {
    return {
      label: "Human gate active",
      body: "The swarm found a risky narrative edge. Approval is holding the final output until a human accepts the safer wording.",
    };
  }

  if (tick <= 2) {
    return {
      label: "Parsing intake",
      body: "Scout is clustering noisy requests into a product brief, a demo frame, and a launch-ready scope.",
    };
  }

  if (tick <= 4) {
    return {
      label: "Routing swarm",
      body: "Builder and Signal are allocating work into distinct lanes so the system can move fast without losing accountability.",
    };
  }

  return {
    label: "Assembling finish",
    body: "Closer is compressing the work into a judge-friendly output: product story, operating model, and final launch checklist.",
  };
}

function buildTasks(tick: number, isDeployed: boolean, isComplete: boolean) {
  return baseTasks.map((task, index) => {
    let status: TaskStatus = "incoming";

    if (isDeployed && tick >= index + 1) {
      status = "parsed";
    }

    if (isDeployed && tick >= index + 2) {
      status = "routed";
    }

    if (isComplete) {
      status = "resolved";
    }

    return { ...task, status };
  });
}

function buildAgents(
  tick: number,
  isDeployed: boolean,
  requiresApproval: boolean,
  isApproved: boolean,
  isComplete: boolean,
) {
  const gateOpen = !requiresApproval || isApproved;
  const closerProgress = !isDeployed ? 0 : gateOpen ? clamp(28 + tick * 14, 0, 100) : 36;
  const qaProgress = !isDeployed ? 0 : requiresApproval && !isApproved ? 74 : clamp(62 + tick * 10, 0, 100);

  const lanes: AgentLaneState[] = [
    {
      name: "Scout",
      role: "Intent clustering",
      icon: Radar,
      progress: !isDeployed ? 0 : clamp(18 + tick * 22, 0, 100),
      state: !isDeployed ? "idle" : tick >= 4 ? "done" : "running",
      note: !isDeployed
        ? "Waiting for a deploy command."
        : tick >= 4
          ? "Normalized 3 chaotic asks into one coherent orchestration brief."
          : "Extracting product intent, urgency, and narrative risk from raw input.",
    },
    {
      name: "Builder",
      role: "Work packaging",
      icon: Workflow,
      progress: !isDeployed ? 0 : clamp(10 + tick * 19, 0, 100),
      state: !isDeployed ? "idle" : tick >= 5 ? "done" : "running",
      note: !isDeployed
        ? "No execution lanes allocated."
        : tick >= 5
          ? "Packed the final plan into a believable product surface and demo flow."
          : "Packaging work into product framing, execution, and launch deliverables.",
    },
    {
      name: "Sentinel",
      role: "Safety review",
      icon: ShieldCheck,
      progress: qaProgress,
      state: !isDeployed
        ? "idle"
        : requiresApproval && !isApproved && tick >= 4
          ? "blocked"
          : isComplete
            ? "done"
            : tick >= 3
              ? "running"
              : "idle",
      note: !isDeployed
        ? "Oversight waiting on active work."
        : requiresApproval && !isApproved && tick >= 4
          ? "Holding final phrasing until the human approval action clears the risk."
          : isApproved
            ? "Approval received. Adjusted messaging and reopened the lane."
            : "Evaluating claims, tone, and ship-readiness before launch packaging.",
    },
    {
      name: "Closer",
      role: "Launch artifact",
      icon: FileOutput,
      progress: closerProgress,
      state: !isDeployed
        ? "idle"
        : isComplete
          ? "done"
          : !gateOpen && tick >= 4
            ? "ready"
            : tick >= 2
              ? "running"
              : "idle",
      note: !isDeployed
        ? "Awaiting routed work."
        : isComplete
          ? "Final launch pack generated and ready for recording."
          : !gateOpen && tick >= 4
            ? "Buffered the finish while waiting for the safety gate."
            : "Turning swarm output into a concise, board-ready launch brief.",
    },
  ];

  return lanes;
}

function computeOutput(
  tick: number,
  isDeployed: boolean,
  requiresApproval: boolean,
  isApproved: boolean,
  isComplete: boolean,
  mode: Mode,
) {
  if (!isDeployed) {
    return {
      readiness: "Awaiting swarm",
      headline: "Deploy the swarm to turn scattered asks into a usable launch artifact.",
      lines: [
        "Chaos Inbox will be clustered into one clean product story.",
        "Agents will route the work, request approval where needed, and produce a final launch pack.",
      ],
      artifact: {
        title: "No generated output yet",
        summary: "The output panel will become the finish line: a polished artifact that reads like real work was done.",
        heroLine: "Idle until Deploy Swarm is pressed.",
        pillars: ["No task routing yet", "No approvals evaluated", "No launch narrative generated"],
        checklist: ["Receive messy input", "Route through agents", "Reveal final shipped result"],
        finishLabel: "Standby",
      } satisfies OutputCard,
    };
  }

  if (requiresApproval && !isApproved && tick >= 4) {
    return {
      readiness: "Awaiting approval",
      headline: "The system has a strong finish, but it is holding the last step behind a human gate.",
      lines: [
        "The launch brief is drafted and the score is climbing.",
        "One narrative phrase was softened to keep the demo credible in front of judges.",
      ],
      artifact: {
        title: "Launch pack drafted",
        summary: "The system already converted the raw asks into a tight orchestration product, but the final narrative needs explicit approval before release.",
        heroLine: "Output is staged, gated, and ready to complete.",
        pillars: [
          "Premium AI orchestration framing",
          "Visible human oversight without killing momentum",
          "A clean demo story that fits a two-minute recording",
        ],
        checklist: [
          "Clustered product asks into one brief",
          "Routed work across four lanes",
          "Pending final approval to publish launch artifact",
        ],
        finishLabel: "Gate active",
      } satisfies OutputCard,
    };
  }

  if (!isComplete) {
    return {
      readiness: "Compiling output",
      headline: "TriageZero is actively compressing noisy product work into a ship-ready finish.",
      lines: [
        "The system is drafting the product story, launch checklist, and demo framing in parallel.",
        `Mode emphasis is currently ${mode}, which is tuning the tone and decision framing.`,
      ],
      artifact: {
        title: "Generated launch artifact",
        summary: "The final surface is taking shape: clear product thesis, accountability by lane, and a presentation-ready outcome.",
        heroLine: "Transforming intent into a polished execution brief.",
        pillars: [
          "Messy input becomes structured execution",
          "Oversight remains visible and specific",
          "Every agent contributes to one coherent finish",
        ],
        checklist: [
          "Draft product positioning",
          "Finalize launch checklist",
          "Publish presentation-ready artifact",
        ],
        finishLabel: "In progress",
      } satisfies OutputCard,
    };
  }

  return {
    readiness: "Launch artifact ready",
    headline: "TriageZero turned three noisy asks into one believable AI orchestration product and a clean launch plan.",
    lines: [
      "The result is concise enough for a live demo but specific enough to feel deployable.",
      "It shows autonomy, oversight, product judgment, and a finish that judges can evaluate quickly.",
    ],
    artifact: {
      title: "TriageZero launch brief",
      summary: "A mobile-first orchestration product that receives chaotic requests, routes them through accountable agents, applies human oversight only where necessary, and emits a polished, ready-to-present launch pack.",
      heroLine: "From chaotic prompts to a finished operating plan in one controlled run.",
      pillars: [
        "Chaos Inbox normalized into product framing, execution flow, and launch narrative",
        "Agent swarm exposed its work, risk posture, and approval boundary in real time",
        "Final output packaged as a premium artifact instead of a generic dashboard summary",
      ],
      checklist: [
        "Product story: AI orchestration cockpit for fast-moving teams",
        "Execution plan: four accountable lanes with visible progress and state",
        "Launch checklist: demo story, oversight posture, and submission readiness aligned",
      ],
      finishLabel: "Ship-ready",
    } satisfies OutputCard,
  };
}

function App() {
  const [mode, setMode] = useState<Mode>("chaos");
  const [isDeployed, setIsDeployed] = useState(false);
  const [tick, setTick] = useState(0);
  const [safetyOn, setSafetyOn] = useState(true);
  const [approvalOn, setApprovalOn] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  const requiresApproval = isDeployed && safetyOn && approvalOn;
  const gateReleased = !requiresApproval || isApproved;
  const isComplete = isDeployed && tick >= (gateReleased ? 8 : 10) && gateReleased;

  useEffect(() => {
    if (!isDeployed || isComplete) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTick((current) => {
        if (requiresApproval && !isApproved && current >= 5) {
          return current;
        }

        return current + 1;
      });
    }, 1100);

    return () => window.clearInterval(timer);
  }, [isApproved, isComplete, isDeployed, requiresApproval]);

  useEffect(() => {
    if (!approvalOn) {
      setIsApproved(true);
      return;
    }

    if (!safetyOn) {
      setIsApproved(true);
      return;
    }

    if (!isDeployed) {
      setIsApproved(false);
    }
  }, [approvalOn, isDeployed, safetyOn]);

  const tasks = useMemo(() => buildTasks(tick, isDeployed, isComplete), [tick, isDeployed, isComplete]);
  const agents = useMemo(
    () => buildAgents(tick, isDeployed, requiresApproval, isApproved, isComplete),
    [tick, isDeployed, requiresApproval, isApproved, isComplete],
  );
  const status = useMemo(
    () => describeStatus(tick, isDeployed, requiresApproval, isApproved, isComplete, mode),
    [tick, isDeployed, requiresApproval, isApproved, isComplete, mode],
  );
  const output = useMemo(
    () => computeOutput(tick, isDeployed, requiresApproval, isApproved, isComplete, mode),
    [tick, isDeployed, requiresApproval, isApproved, isComplete, mode],
  );

  const routedCount = tasks.filter((task) => task.status === "routed" || task.status === "resolved").length;
  const resolvedCount = tasks.filter((task) => task.status === "resolved").length;
  const completedAgents = agents.filter((agent) => agent.state === "done").length;

  const scoreBreakdown = {
    technical: clamp(74 + routedCount * 6 + completedAgents * 2, 0, 99),
    autonomy: clamp(70 + routedCount * 5 + (isDeployed ? 6 : 0) + (isComplete ? 8 : 0), 0, 99),
    clarity: clamp(73 + completedAgents * 5 + (mode === "launch" ? 6 : 2), 0, 99),
    safety: clamp(56 + (safetyOn ? 21 : -10) + (approvalOn ? 10 : -8) + (isApproved ? 6 : 0), 0, 99),
  };
  const totalScore = Math.round(
    (scoreBreakdown.technical + scoreBreakdown.autonomy + scoreBreakdown.clarity + scoreBreakdown.safety) / 4,
  );

  function deploySwarm() {
    setIsDeployed(true);
    setTick(1);
    setIsApproved(!safetyOn || !approvalOn);
  }

  function approveRun() {
    if (!isDeployed) {
      return;
    }

    setIsApproved(true);
    setTick((current) => Math.max(current, 6));
  }

  const modeInfo = modeMeta[mode];
  const approvalButtonLabel = !isDeployed
    ? "Approval unlocks after deploy"
    : requiresApproval && !isApproved
      ? "Approve safety adjustment"
      : "Approval already cleared";

  return (
    <main className={`app-shell mode-${mode}`}>
      <section className="product-stage" aria-label="TriageZero orchestration demo">
        <div className="skyline" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Zap size={18} />
            </div>
            <div>
              <p>TriageZero</p>
              <span>AI orchestration product</span>
            </div>
          </div>
          <div className="topbar-meta">
            <div className="meta-pill">
              <Sparkles size={14} />
              {modeInfo.accent}
            </div>
            <div className="freeze-timer" aria-label="Run timer">
              <Clock3 size={15} />
              <strong>{isComplete ? "done" : "59:12"}</strong>
            </div>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-copy panel hero-card">
            <p className="eyebrow">{modeInfo.eyebrow}</p>
            <h1>{modeInfo.title}</h1>
            <p className="hero-body">{modeInfo.body}</p>
          </div>
          <ScoreDial score={totalScore} />
        </section>

        <section className="mode-switch" aria-label="Operating mode">
          {(["chaos", "factory", "launch"] as const).map((item) => (
            <button
              className={mode === item ? "active" : ""}
              key={item}
              type="button"
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </section>

        <section className="action-row">
          <button className="swarm-button" type="button" onClick={deploySwarm}>
            <WandSparkles size={19} />
            Deploy Swarm
          </button>
          <div className="status-strip">
            <span>{status.label}</span>
            <p>{status.body}</p>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="panel chaos-panel">
            <PanelTitle icon={Flame} label="Chaos Inbox" count={`${routedCount}/3 routed`} />
            <div className="task-list">
              {tasks.map((task) => (
                <article className={`task-card ${task.status}`} key={task.raw}>
                  <div className="task-header">
                    <span>{task.source}</span>
                    <b>{task.priority}</b>
                  </div>
                  <strong>{task.status === "incoming" ? task.raw : task.refined}</strong>
                  <p>{task.status === "incoming" ? task.owner : task.lane}</p>
                  <div className="task-footer">
                    <small>{task.status}</small>
                    <ChevronRight size={16} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel agent-panel">
            <PanelTitle icon={Bot} label="Agent Lanes" count={`${completedAgents}/4 done`} />
            <div className="agent-list">
              {agents.map((agent) => (
                <AgentLane agent={agent} key={agent.name} />
              ))}
            </div>
          </div>

          <div className="panel oversight-panel">
            <PanelTitle icon={ShieldCheck} label="Oversight" count={requiresApproval && !isApproved ? "gate active" : "clear"} />
            <ToggleRow
              label="Block risky narrative jumps"
              active={safetyOn}
              onClick={() => setSafetyOn((value) => !value)}
            />
            <ToggleRow
              label="Require human release"
              active={approvalOn}
              onClick={() => setApprovalOn((value) => !value)}
            />
            <button
              className={`approval-card ${requiresApproval && !isApproved ? "hot" : ""}`}
              type="button"
              onClick={approveRun}
            >
              {requiresApproval && !isApproved ? <CircleAlert size={18} /> : <LockOpen size={18} />}
              <span>
                {approvalButtonLabel}
                <small>
                  {requiresApproval && !isApproved
                    ? "Reword the final pitch to keep it credible and unblock the closing lane."
                    : "The final pack can move without another manual checkpoint."}
                </small>
              </span>
            </button>
          </div>

          <div className="panel radar-panel">
            <PanelTitle icon={Gauge} label="Score Radar" count={output.readiness} />
            <div className="factor-list">
              {Object.entries(scoreBreakdown).map(([label, value]) => (
                <div className="factor" key={label}>
                  <span>{label}</span>
                  <div>
                    <i style={{ width: `${value}%` }} />
                  </div>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="panel output-panel">
            <PanelTitle icon={FileOutput} label="Generated Output" count={output.artifact.finishLabel} />
            <div className={`artifact-shell ${isComplete ? "ready" : ""}`}>
              <div className="artifact-intro">
                <small>{output.readiness}</small>
                <h2>{output.artifact.title}</h2>
                <p>{output.artifact.summary}</p>
              </div>

              <div className="artifact-hero">
                <strong>{output.artifact.heroLine}</strong>
                <p>{output.headline}</p>
              </div>

              <div className="artifact-columns">
                <section>
                  <h3>What the swarm produced</h3>
                  <ul className="artifact-list">
                    {output.artifact.pillars.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>Launch checklist</h3>
                  <ul className="artifact-list checklist">
                    {output.artifact.checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="artifact-summary">
                {output.lines.map((line) => (
                  <div key={line}>
                    <CheckCheck size={16} />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="status-toast" role="status">
          <GitBranchPlus size={15} />
          {resolvedCount > 0
            ? "Run complete. Chaos normalized, approvals cleared, artifact packed."
            : isDeployed
              ? status.body
              : "Press Deploy Swarm to trigger the orchestration run."}
        </div>

        <nav className="bottom-nav" aria-label="Primary">
          <button className="active" type="button">
            <Bot size={18} />
            Swarm
          </button>
          <button type="button">
            <TimerReset size={18} />
            Timeline
          </button>
          <button type="button">
            <CheckCheck size={18} />
            Launch
          </button>
        </nav>
      </section>
    </main>
  );
}

function PanelTitle({ icon: Icon, label, count }: { icon: LucideIcon; label: string; count: string }) {
  return (
    <div className="panel-title">
      <span>
        <Icon size={15} />
        {label}
      </span>
      <small>{count}</small>
    </div>
  );
}

function ScoreDial({ score }: { score: number }) {
  return (
    <div className="score-dial" style={{ "--score": `${score * 3.6}deg` } as CSSProperties}>
      <div>
        <span>{score}</span>
        <small>launch score</small>
      </div>
    </div>
  );
}

function AgentLane({ agent }: { agent: AgentLaneState }) {
  const Icon = agent.icon;

  return (
    <article className={`agent-lane ${agent.state}`}>
      <div className="agent-icon">
        <Icon size={17} />
      </div>
      <div className="agent-body">
        <div>
          <strong>{agent.name}</strong>
          <span>{agent.role}</span>
        </div>
        <p>{agent.note}</p>
        <div className="meter">
          <i style={{ width: `${agent.progress}%` }} />
        </div>
      </div>
      <em>{agent.state}</em>
    </article>
  );
}

function ToggleRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className="toggle-row" type="button" onClick={onClick} aria-pressed={active}>
      <span>{label}</span>
      <i className={active ? "on" : ""} />
    </button>
  );
}

export default App;
