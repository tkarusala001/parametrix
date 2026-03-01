# Parametrix



Parametrix is an AI-powered architectural CAD editor that generates and modifies OpenSCAD models of buildings and structures through natural language. Describe what you want to build and Parametrix produces parametric, editable OpenSCAD code with realistic materials and accurate proportions, rendered live in the browser.

## What it does

You type a prompt. Parametrix generates a fully parametric OpenSCAD model with realistic material colors, proper structural proportions, and adjustable parameters for every dimension. The model compiles in a WebAssembly OpenSCAD runtime and renders in a 3D viewer directly in the browser. You can iterate on the model by continuing the conversation, tweaking sliders and inputs in the parameter panel, or uploading an STL file to modify an existing model.

The architecture prompt engine enforces real-world building conventions: walls are built to standard heights, doors and windows are cut into wall openings rather than floated in front of them, furniture faces logically, multi-story floors stack at the correct Z heights, and exterior elements align to the surfaces they belong to. Every building component is tagged so materials can be assigned independently in the viewer.

## Tech stack

**Frontend**
React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Three.js, React Three Fiber

**Backend**
Supabase (Postgres, Auth, Storage, Edge Functions), Deno, OpenRouter API

**CAD**
OpenSCAD compiled to WebAssembly, custom architecture parts library, BOSL2 and MCAD libraries

**AI models supported**
Claude Opus 4.6, Claude Sonnet 4.5, GPT-5.2, Gemini 3 Pro, Gemini 3 Flash

## Getting started

**Prerequisites**

Node.js 18 or later, Supabase CLI, Deno 1.40 or later, an OpenRouter API key

**Install dependencies**

```
npm install
```

**Set up environment variables**

Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Create `supabase/functions/.env` with your API key:

```
OPENROUTER_API_KEY=your_openrouter_key
ENVIRONMENT=local
```

**Start Supabase locally**

```
supabase start
supabase db reset
```

**Serve edge functions**

```
supabase functions serve --env-file supabase/functions/.env
```

**Start the dev server**

```
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project structure

```
src/
  components/       UI components including chat, viewer, parameter panel, and history
  contexts/         React context providers for auth, mode, color, and material state
  services/         Conversation and message service layer over Supabase
  views/            Top-level page views
  workers/          OpenSCAD WebAssembly compile worker
supabase/
  functions/        Edge functions: chat, title-generator, prompt-generator
  migrations/       Postgres schema migrations
public/
  libraries/        architecture_parts.scad and BOSL/BOSL2/MCAD OpenSCAD libraries
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

## License

MIT. See [LICENSE](LICENSE) for details.
