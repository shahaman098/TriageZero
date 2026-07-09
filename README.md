# TriageZero

TriageZero is a polished AI orchestration product demo built with React, TypeScript, and Vite. It presents a believable control room for turning messy input into a finished launch artifact, with visible agent activity, human oversight, scoring, and a generated output panel that acts as the final payoff.

The project is designed to feel like a real product, not a toy dashboard. It is intentionally scoped around the exact orchestration flow we wanted to show on screen.

## What It Does

TriageZero takes three noisy incoming requests and turns them into a structured launch flow:

- `Chaos Inbox` collects raw, messy requests.
- `Agent Lanes` show multiple agent roles working in parallel.
- `Oversight` provides safety toggles and a human approval gate.
- `Score Radar` reflects how complete and shippable the run is.
- `Generated Output` reveals the finished artifact after orchestration completes.

The result is a live, cinematic UI that makes the workflow easy to understand at a glance.

## Core Experience

The app is centered on a single run:

1. Start in `chaos`, `factory`, or `launch` mode.
2. Press `Deploy Swarm`.
3. Watch the inbox items move through parsing and routing.
4. Watch agents progress through their lanes.
5. Approve the blocked step if the oversight gate requires it.
6. Reveal the final generated output.

The goal is to show:

- messy input becoming structured work
- visible autonomy
- human approval where it matters
- a final output that looks useful and finished

## How It Works

The behavior is implemented entirely in the frontend with local state and deterministic orchestration logic.

### State Model

The app keeps track of:

- current mode
- whether the swarm has been deployed
- a ticking progress counter
- safety and approval toggles
- whether human approval has been granted

### Task Flow

The inbox is driven by three base tasks defined in `src/App.tsx`. Each task has:

- a source
- a raw request
- an owner
- a priority
- a refined version
- a lane label
- a status

As the run advances, tasks move through:

- `incoming`
- `parsed`
- `routed`
- `resolved`

### Agent Flow

Each agent lane has:

- a name
- a role
- an icon
- a progress value
- a state
- a live note

The agents update automatically on a timer after deployment. Their progress and state help make the system feel active and responsive.

### Oversight

The oversight panel models the human-in-the-loop part of the product:

- one toggle can block risky narrative jumps
- another toggle can require human release
- the approval action unblocks the final step when needed

This keeps the demo believable: the system is autonomous, but not reckless.

### Generated Output

The strongest visual payoff is the `Generated Output` panel.

It changes based on the current stage of the run:

- before deployment, it explains that the system is waiting
- during execution, it shows the artifact being assembled
- when approval is required, it shows a gated draft state
- once complete, it presents a finished launch brief

The output is intentionally written like a real artifact:

- product summary
- hero line
- generated pillars
- launch checklist
- final readiness label

This is the part of the UI that makes the demo feel like the system actually produced something.

## Why It Feels Real

The product avoids generic “AI dashboard” behavior by emphasizing:

- a specific workflow
- visible state transitions
- a meaningful approval step
- a final artifact with structure and content
- a premium, mobile-first presentation layer

It does not try to simulate everything. It only simulates the pieces that make the story convincing.

## Tech Stack

- React 19
- TypeScript
- Vite
- Lucide React icons
- Local component state and deterministic UI logic

## File Structure

- [`src/App.tsx`](./src/App.tsx) contains the orchestration logic, state transitions, and output generation.
- [`src/styles.css`](./src/styles.css) contains the visual system and responsive layout.
- [`src/main.tsx`](./src/main.tsx) mounts the app.

## Running Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## How The Video Was Made

The recording was assembled as a product story, not as a random screen capture.

### Cursor iOS

Cursor iOS was used as the build and iteration surface to shape the product logic, refine the UI, and tighten the demo flow. That made it possible to quickly adjust:

- the orchestration sequence
- the generated output content
- the copy used for the pitch
- the timing of state transitions

### FAL AI

FAL AI was used to generate the video asset that supported the presentation. That helped create a more cinematic final package by adding a strong visual layer around the product demo.

In practice, the workflow was:

1. shape the product and demo flow in Cursor iOS
2. refine the UI and output states in the app
3. generate the supporting video asset with FAL AI
4. combine the polished product surface with the recorded walkthrough

The end result is a presentation that feels like a real launch story.

## Demo Intent

This project is intentionally narrow:

- it is not a full backend platform
- it is not a general-purpose builder
- it is not an account system or workflow engine

It is a focused, high-impact demo that shows:

- chaos intake
- agent orchestration
- human oversight
- a strong output moment

## License

No license has been added yet.
