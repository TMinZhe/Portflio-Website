import type { Project } from "../types";

/*
 * AI Operations Assistant: the case-study content.
 *
 * Sources: the technical audit (Projects Audit/LLM Audit.md, 2026-10-22) and
 * the owner's confirmations of 2026-10-22:
 * - the owner independently designed, built and deployed the whole assistant;
 * - it is in production, self-hosted, and used by operations staff daily;
 * - it now runs Qwen3-30B-A3B INT4. The audited benchmark and device figures
 *   were measured on the earlier Qwen3-8B setup and are labelled that way.
 * - the restock, P&L and PO engines are Python ports of the inventory
 *   platform's logic: say "ported", never "invented for this project".
 * - developed at Unistop Tech in collaboration with the Intel team. Don't
 *   attribute any optimisation to Intel, or imply Intel owns or endorses it.
 *
 * Never claim: RAG, general text-to-SQL, fine-tuning, autonomous agents,
 * hallucination-proof output, a routing-accuracy figure (not re-run), usage
 * counts or business impact, a live WhatsApp channel, or automatic PO creation.
 * Never publish the audit's security gaps, schema, hosts or real store data.
 * All visuals are synthetic recreations; no production conversation is shown.
 */

const SLUG = "ai-operations-assistant";

export const aiOperationsAssistant: Project = {
  slug: SLUG,
  status: "published",
  featured: true,
  title: "AI Operations Assistant",
  category: "Applied AI · LLM Systems · Edge Inference",
  organisation: "Unistop Tech",
  collaboration: "Intel team",
  confidential: true,
  experience: ["unistop-tech"],

  homeCard: {
    label: "AI assistant",
    category: "Applied AI / LLM Systems",
    headline: "Business answers powered by AI. Numbers calculated by code.",
    summary: "Independently developed a self-hosted AI assistant used for daily operational queries, combining local language-model understanding with deterministic business calculations.",
    proof: "Production-deployed and used daily.",
    tags: ["Python", "Qwen3", "OpenVINO"],
    visualNote: "Interface recreation · synthetic data",
  },

  summary:
    "A self-hosted AI assistant that operations staff use every day to ask about inventory, sales, restocking, purchasing and profit. A local language model reads each question; deterministic Python and SQL calculate the answer.",
  headline: "Business answers powered by AI. Numbers calculated by code.",
  homeHeadline: "Business answers powered by AI. Numbers calculated by code.",
  builtLine:
    "Independently developed a self-hosted AI assistant that employees use for daily operational questions. Combined local LLM-based intent understanding with deterministic Python and SQL to deliver inventory, sales, purchasing and profitability answers.",
  highlights: [
    "Guardrailed natural-language routing and deterministic numerical outputs.",
    "On-device Qwen3-30B-A3B INT4 inference using Intel GPU/NPU acceleration.",
    "A 133-case labelled evaluation set and measured inference optimisation.",
  ],
  outcomeLine: "Production-deployed and actively used for daily operational queries.",
  coverNote: "Illustrative interface recreation using synthetic operational data. Not a production conversation.",
  facts: [
    { label: "Role", value: "AI Engineer · sole developer" },
    { label: "Built at", value: "Unistop Tech" },
    { label: "Industry collaboration", value: "Intel team" },
    { label: "Status", value: "In production · used daily by operations staff" },
    { label: "Runs on", value: "Self-hosted · Qwen3-30B-A3B INT4 on Intel GPU and NPU" },
  ],
  technologies: ["Python", "Qwen3-30B-A3B INT4", "OpenVINO", "MariaDB", "Open WebUI", "Intel Arc GPU · NPU", "systemd", "unittest"],

  overview: [
    "I independently built a self-hosted AI assistant that helps retail operators ask questions about inventory, sales and profitability in natural language. A local language model interprets each request, while deterministic Python handles the calculations behind the answer.",
    "Developed at Unistop Tech in collaboration with the Intel team.",
  ],
  role:
    "I was the sole developer: I designed, built, deployed and debugged the assistant end to end. Its restocking, purchasing and profit calculations reuse business logic from the Inventory & Retail Operations Platform, which I also worked on extensively. For this project I ported those engines to Python; the AI system around them is new.",
  ownership: [
    { name: "Question understanding", what: "The routing pipeline: structured intent classification, entity extraction and validation." },
    { name: "Guardrails", what: "Python checks and routing overrides that correct the model's reading before anything runs." },
    { name: "Conversation", what: "Multi-turn follow-ups and clarifying questions." },
    { name: "Answers", what: "Predefined SQL reports, deterministic calculation, Python-written answers and optional model narration." },
    { name: "Evaluation", what: "A labelled routing test set, an evaluation harness and a regression-testing workflow." },
    { name: "Integrations", what: "The company database, Python ports of the inventory, purchasing and financial engines, and Open WebUI." },
    { name: "Inference", what: "Local Qwen3-30B-A3B INT4 deployment on OpenVINO, Intel GPU and NPU integration, and latency optimisation." },
    { name: "Operations", what: "Deployment as services, monitoring through a turn log, and debugging in production." },
  ],

  problem: [],
  features: [],

  aiStory: {
    headings: {
      overview: "An AI assistant built for everyday operational decisions.",
      problem: "Business questions shouldn't require navigating databases.",
      try: "Ask it something.",
      how: "The model understands the question. Code produces the answer.",
      engineering: "Reliability, speed and evidence.",
      impact: "From an AI prototype to a tool used in daily operations.",
    },
    glance: [
      { label: "The problem", text: "Staff need quick, trustworthy answers about stock, sales and profit, without digging through databases or reports." },
      { label: "What I built", text: "The whole assistant, on my own: question understanding, guardrails, calculations, evaluation and on-device model serving." },
      { label: "Where it stands", text: "Deployed on local hardware and used by operations staff for their daily questions." },
    ],
    problem: {
      paragraphs: [
        "Operations staff regularly need to know what's in stock, what to restock, how sales are going, what to order and what each store earns. The answers live in the company database and in several reports.",
        "Understanding a question is only half the job. The answer also has to be numerically right, because staff act on it.",
      ],
      before: ["Operator", "Several dashboards and reports", "Manual filtering", "Interpretation"],
      after: ["Operator", "A question in plain words", "Checked report selection", "Calculated answer"],
      challenge: "A language model can interpret a question, but that doesn't make it a reliable accounting or inventory calculator.",
    },
    tryIntro:
      "Pick a question to see the kind of answer staff get, then try a follow-up. The answers come from a small made-up dataset; the assistant's real answers follow the same pattern.",
    chat: "ai-chat",
    chatNote: "Interactive recreation using fictional stores, products and operational data. No company systems are connected.",
    howIntro:
      "Rather than letting the model do everything, the assistant gives it two narrow jobs: reading the question and, for a few answer types, writing up figures that were already calculated. Step through one question to see where the model stops and code takes over.",
    pipeline: "ai-pipeline",
    engineering: [
      { name: "Structured output parsing", what: "The router returns JSON. Thinking blocks and code fences are stripped, the JSON span is extracted, defaults are filled in, and any failure becomes “unknown” rather than an error." },
      { name: "Validation", what: "Placeholder values the model invents (“unknown”, “product”) are cleared, and store names are checked against a directory built from the database." },
      { name: "Routing overrides", what: "Phrase overrides and report rules in Python can take precedence over the model's choice, and structural rewrites fix known mix-ups such as a profit question with no product." },
      { name: "Entity resolution", what: "Stores are matched by full name, number or unique first word, typos are fuzzy-matched, and shared names trigger a “which one?” question." },
      { name: "Second-chance routing", what: "If nothing else matches, a second model call picks from a catalogue of about 30 reports, or says none fits. The answer is labelled with how it was read." },
      { name: "Multi-turn state", what: "The model only flags a follow-up. Python fills in everything the follow-up didn't change from the previous turn." },
      { name: "Deterministic rendering", what: "More than 20 answer types are written by Python, so figures never pass through the model." },
      { name: "Narrator payload limits", what: "Where the model does write up results, its input is capped at 6,000 characters and trimmed with an honest count of what was left out." },
    ],
    stories: [
      {
        id: "guardrails",
        kicker: "Reliability",
        heading: "Designing guardrails around imperfect language-model outputs.",
        paragraphs: [
          "A local model will sometimes misread a store name, leave out a detail or file a question under the wrong type. Instead of trusting its reading, the assistant checks it in several layers of ordinary code, and asks the operator when it can't be sure.",
        ],
        visuals: ["ai-guardrails"],
        detailsLabel: "Every layer of checks",
        details: [
          { name: "Store names", what: "Aliases built from the database; typos fuzzy-matched; unknown places refused with an explicit “I don't know that store”." },
          { name: "Low confidence", what: "When the model isn't confident, the assistant asks “Did you mean…?” before running anything." },
          { name: "Rule-based overrides", what: "Python rules route known phrasings directly, so new question types don't need prompt edits." },
          { name: "Second-chance routing", what: "Unmatched questions get one more, catalogue-based attempt before the assistant says it can't help." },
          { name: "Follow-ups", what: "A short follow-up reuses the previous question's details, and a long, self-contained question is never mistaken for one." },
        ],
      },
      {
        id: "inference",
        kicker: "Speed",
        heading: "Optimising inference without relying on a cloud API.",
        paragraphs: [
          "The model runs on the company's own machine, on an Intel processor's built-in GPU and NPU, so questions are answered without sending anything to a cloud API. Getting answers back in seconds rather than a minute took several changes: keeping the model loaded, caching the fixed part of the prompt, streaming answers, and calling the model less often.",
        ],
        visuals: ["ai-inference", "ai-latency"],
        detailsLabel: "Inference engineering detail",
        details: [
          { name: "Persistent pipelines", what: "One copy of the model per device stays loaded. The earlier setup reloaded the model per call, which the August benchmark identified as the main cost." },
          { name: "GPU first, NPU overflow", what: "Each request takes the first idle device, preferring the GPU. In a device comparison on the Qwen3-8B setup, routing took 2.6s on the GPU and 6.6s on the NPU." },
          { name: "Prefix caching", what: "The roughly 3,200-token router prompt is processed once and reused; time to first token was about 130ms on the Qwen3-8B setup." },
          { name: "Streaming", what: "Answers stream as server-sent events, and generation stops if the client disconnects." },
          { name: "Fewer model calls", what: "Python-written answers cut model write-ups from 1.00 to 0.58 per question in the benchmark." },
          { name: "Not yet measured", what: "Behaviour under several simultaneous users hasn't been benchmarked." },
        ],
      },
      {
        id: "evaluation",
        kicker: "Evidence",
        heading: "Treating AI behaviour as something to test, not assume.",
        paragraphs: [
          "Changing a prompt to fix one question can quietly break others. So routing is measured against 133 hand-labelled questions, comparing what the system actually did with what it should have done, and failed or unclear questions from real use are reviewed and turned into fixes and new test cases.",
        ],
        visuals: ["ai-eval"],
        detailsLabel: "Evaluation and testing detail",
        details: [
          { name: "Golden routing set", what: "133 hand-labelled questions across 35 intent labels, scored on the final routed intent and its fields." },
          { name: "Raw vs effective", what: "The harness scores the model's own choice and the system's final choice after the Python checks separately." },
          { name: "Consistency", what: "Repeated runs check that the same question is routed the same way; this is reported as consistency, never as accuracy." },
          { name: "Unit tests", what: "190 offline tests run with the model mocked; 189 passed in the audit run, and the remaining one needs a database connection." },
          { name: "Miss review", what: "A turn log records each question and how it was routed, never the answer, and a script groups the unanswered and uncertain ones for review." },
          { name: "Prompt discipline", what: "After few-shot prompt edits regressed other questions, new question types are added as Python rules and the prompt is left alone." },
        ],
      },
    ],
    archive: [
      {
        label: "Predefined operational reports",
        items: [
          { name: "Stock", what: "Store and warehouse stock, expiry, overstock and velocity bands." },
          { name: "Sales", what: "Summaries against the previous period, trends, sales by hour and weekday, product sales and transaction lookups." },
          { name: "Restocking and slots", what: "Restocking list previews and product slot recommendations." },
          { name: "Purchasing", what: "Purchase-order recommendations from a nightly report." },
          { name: "Profit", what: "Store profit and loss, and product and category profit rankings." },
          { name: "Pricing and products", what: "Prices including promotions, promotion and add-on performance, products bought together, store comparisons and vendor lookups." },
        ],
      },
      {
        label: "Integration with the inventory platform's engines",
        items: [
          {
            name: "Ported, not reinvented",
            what: "The restocking forecast, the profit-and-loss logic and the purchase-order safety stock are Python ports of the Inventory & Retail Operations Platform's business logic, so the assistant's figures match the platform's. That case study explains the forecasting and costing in depth.",
          },
          { name: "One shared module", what: "The assistant and the nightly purchasing job import the same forecasting code, so their numbers can't drift apart." },
        ],
      },
      {
        label: "Nightly purchase recommendations",
        items: [
          { name: "Precomputed overnight", what: "A scheduled job calculates purchase recommendations each night and caches the report; the assistant reads that report, so answers can be up to a day old." },
          { name: "Not automated", what: "Creating purchase orders in the database automatically is built but kept in dry-run mode." },
        ],
      },
    ],
    measured: [
      { label: "Mean response time", value: "57s → 11s", note: "Historical benchmark across two different hardware and software setups. See the caveats in Behind the engineering." },
      { label: "Labelled routing cases", value: "133", note: "Hand-labelled questions used to check routing after every change. No accuracy figure is quoted until it is re-run." },
      { label: "Offline unit tests", value: "189 of 190", note: "Passing in the audit run; the remaining test needs a database connection." },
    ],
    reflection: [
      "Building this assistant taught me that reliable AI systems depend as much on the deterministic software surrounding a model as on the model itself.",
      "The most important decision was where the model should stop: it reads the question, and code does everything that has to be right. Measuring routing against labelled questions, rather than trusting a few good-looking answers, is what made it safe to keep changing the system.",
      "Real data and real questions were messier than any prompt anticipated: ambiguous store names, short follow-ups and stores that hadn't synced. Handling those cases explicitly, and making the assistant ask when it isn't sure, mattered more than the model's size.",
    ],
    related: ["inventory-replenishment"],
  },

  decisions: [
    {
      decision: "The model reads and narrates; Python calculates and writes answers",
      basis: "verified",
      reason: "A local model is unreliable at arithmetic and at carrying state across turns. Keeping it out of the calculations makes every figure exact and auditable.",
      tradeoff: "Every new type of question needs code; the assistant can't answer something no report covers.",
    },
    {
      decision: "New question types as Python rules, not prompt edits",
      basis: "verified",
      reason: "Editing the router prompt to fix one question regressed others.",
      tradeoff: "Routing stays stable, but the rule list grows and its order matters.",
    },
    {
      decision: "A second-chance report catalogue instead of model-written SQL",
      basis: "verified",
      reason: "Every answer then comes from a tested report. Model-written SQL is parked behind a written safety specification until missed questions justify it.",
      tradeoff: "Questions no report covers still get “I can't answer that”.",
    },
    {
      decision: "A separate model service with one pipeline per device",
      basis: "verified",
      reason: "Several processes need the model, and it must not load per process. GPU-first scheduling with NPU overflow lets two conversations run at once.",
      tradeoff: "A simple lock-based scheduler, without batching requests on the same device.",
    },
    {
      decision: "Port the inventory engines instead of calling the platform",
      basis: "verified",
      reason: "The assistant's figures need to match the platform's dashboards.",
      tradeoff: "Two implementations of the same logic that could drift, and no automated cross-check between them yet.",
    },
    {
      decision: "Deterministic follow-ups, where “not mentioned” means “keep”",
      basis: "verified",
      reason: "The model re-reads each turn from scratch and drops details; Python merging them back is predictable.",
      tradeoff: "A follow-up can't express “go back to the default”.",
    },
  ],
  challenges: [],

  resultsIntro: [
    "The assistant is deployed on local hardware and used by Unistop's operations staff for daily questions about inventory, sales, profitability and purchasing.",
  ],
  outcomes: [
    { kind: "capability", label: "Deployed and self-hosted; no cloud model API" },
    { kind: "capability", label: "Used by operations staff for daily operational questions" },
    { kind: "capability", label: "About 30 types of operational question and report" },
    { kind: "capability", label: "Figures calculated by code, never by the model" },
  ],
  nextSteps: [
    { name: "Conversation memory", what: "State is kept in memory, covers the last two turns and is lost on restart." },
    { name: "Code structure", what: "The core module is large, about 5,700 lines, and the routing rules are a long, order-dependent chain." },
    { name: "Engine cross-checks", what: "The ported engines aren't yet tested against the original platform's results, and some have no direct unit tests." },
    { name: "Benchmarks", what: "The latency benchmark is small and single-user; the current Qwen3-30B-A3B setup and multi-user load still need measuring." },
    { name: "Channels and automation", what: "A WhatsApp channel is built but not deployed, and automatic purchase-order creation remains in dry-run." },
    { name: "Model-written SQL", what: "A validated SQL fallback is specified but parked until missed questions justify it." },
  ],
  lessons: [],

  showcase: "ai-chat",
  gallery: [],
  links: { demo: null, repo: null },
};
