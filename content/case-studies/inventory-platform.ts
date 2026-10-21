import type { PortfolioMedia, Project } from "../types";
import { projectImage } from "../media";

/*
 * Inventory & Retail Operations Platform: the case-study content.
 *
 * Sources: the technical audit (Projects Audit/Inventory Replenishment Audit)
 * and the owner's confirmations of 2026-10-21:
 * - deployed in production and the business's main operational system;
 * - the owner developed most of the platform, including every commit on the
 *   forecast, outbox/queue, delta delivery, sync service, COGS and pricing code;
 *   a second contributor worked mainly on early UI and positions (June–July 2026);
 * - 13 stores is the current production scope and may be published;
 * - production forecast constants are NOT published: the explorer uses demo values.
 *
 * Never publish: store names or locations, real products, prices or sales,
 * internal hosts or addresses, schema detail, or the security findings in the
 * audit (reported privately to the owner).
 *
 * Screens: interface recreations with synthetic data (see `recreation` below),
 * pending the owner's approval. Raw captures of the live system stay in the
 * git-ignored "Project Screenshots" folder and are never published.
 */

const SLUG = "inventory-replenishment";

/**
 * An interface recreation: the production layout rebuilt with synthetic data.
 * Flip APPROVED only after the owner has reviewed every file, then copy the
 * files from "Project Screenshots/inventory-platform/recreation/candidates".
 */
const APPROVED = false;
const recreation = (file: string, meta: Pick<PortfolioMedia, "alt" | "title">): PortfolioMedia =>
  projectImage(SLUG, file, {
    ...meta,
    category: "screenshot",
    isIllustrative: true,
    approved: APPROVED,
    aspect: "16/9",
    caption: "Interface recreation based on the production application, using synthetic data.",
  });

export const inventoryPlatform: Project = {
  slug: SLUG,
  status: "published",
  featured: true,
  title: "Inventory & Retail Operations Platform",
  category: "Full-Stack Engineering / Distributed Systems / Inventory Optimization",
  organisation: "Unistop Tech",
  confidential: true,
  experience: ["unistop-tech"],

  summary:
    "The production platform a chain of automated retail stores runs on: warehouse stock, replenishment, purchasing and reporting, kept correct even when store databases go offline.",
  headline: "Building reliable inventory operations across independently connected stores.",
  homeHeadline: "Keeping retail operations reliable, even when stores go offline.",
  builtLine:
    "Developed the majority of a production retail management platform integrating warehouse inventory, purchasing, stock replenishment and operational reporting. Engineered statistical forecasting and offline-tolerant inventory synchronization across independently managed store databases.",
  highlights: [
    "Reliable stock delivery using durable queues, idempotent updates and retry handling.",
    "Statistical replenishment forecasting with stockout correction and service-level safety stock.",
    "Inventory integrity through live-stock verification, transactional reservations and concurrency safeguards.",
  ],
  outcomeLine: "Primary production operations platform used by the business.",
  facts: [
    { label: "Role", value: "AI Engineer · developed most of the platform" },
    { label: "Built at", value: "Unistop Tech" },
    { label: "Role since", value: "May 2026 – present" },
    { label: "Status", value: "In production · the business's main operations system" },
  ],
  technologies: ["React", "Node.js", "Express", "MySQL", "JavaScript", "Vite", "Tailwind CSS"],

  headings: {
    problem: "Inventory management becomes harder when every store has its own database.",
    role: "Developing the core of the operational platform.",
    walkthrough: "One platform for day-to-day retail operations.",
    architecture: "Cached reads, live checks and queued writes, kept apart.",
    decisions: "Decisions and their trade-offs.",
    capabilities: "The rest of the platform.",
    results: "From implementation to daily operations.",
    "next-steps": "Constraints and future improvements.",
  },

  overview: [],
  problem: [
    "Each automated store runs its own local MySQL database, which holds the truth about its shelves, positions and sales. The office reaches those databases over a private network, and any of them can be unreachable at a given moment.",
    "The office platform still has to show stock across every store, plan replenishment, coordinate purchasing and the warehouse, and report on sales. Information read from a store can be hours old, a change sent to a store can fail halfway, and a retried change must never add the same stock twice or overwrite sales that happened in the meantime.",
  ],
  problemFigure: "store-topology",

  role:
    "As an AI Engineer at Unistop Tech, I developed the majority of the platform's functionality, spanning inventory operations, replenishment, backend workflows and operational reporting. I designed and built the replenishment forecast, the offline store-delivery pipeline, the snapshot sync service and the financial reporting logic. The repository has another contributor, whose work was mainly early interface and position-management screens.",
  ownership: [
    { name: "Full-stack application", what: "React screens and the Express API behind them, from top-up planning to purchasing and sales reports." },
    { name: "Backend business logic", what: "Service-layer workflows in raw, parameterized SQL with explicit transactions and row locks." },
    { name: "Replenishment forecasting", what: "The statistical demand estimate and the reorder-point and target policy behind every top-up list." },
    { name: "Synchronization and delivery", what: "The durable per-store write queue, stock deltas, idempotent application at the store, and the separate snapshot sync service." },
    { name: "Warehouse and purchasing", what: "Batches with expiry, first-expiry-first-out reservations, purchase orders and goods receiving with landed costs." },
    { name: "Reporting and data integration", what: "Sales and profitability reports, cost-of-goods from a frozen cost ledger, and revenue allocated from what was actually charged." },
    { name: "Operational interfaces", what: "Delivery-state badges, stale-data notices and conflict messages, so staff can see what each store will have." },
  ],

  features: [],

  walkthrough: [
    {
      media: recreation("stock-positions.webp", {
        alt: "Rack layout for an offline store opened from its last known data, with a banner explaining that quantity edits are saved as changes and applied when the store reconnects, and inactive positions holding units",
        title: "Stock positions, store offline",
      }),
      title: "Inventory and shelf positions",
      does: "Shows every rack, level and position in a store, with product, fill against capacity and inactive positions. An offline store opens from its last known data, and the screen says so.",
      why: "Staff can keep working on a store that is unreachable, and can see exactly what will happen to their changes.",
      engineering: "Quantity edits on an offline store are stored as deltas (\"+2\") and delivered when it reconnects; units in an inactive position are held off sale.",
    },
    {
      media: recreation("store-monitoring.webp", {
        alt: "Dashboard with a panel per store showing temperatures, camera feeds and today's sales, one store still being checked",
        title: "Store-wide monitoring",
      }),
      title: "Store-wide monitoring",
      does: "Shows each store's temperatures, camera feeds and today's sales side by side.",
      why: "The stores are unattended, so this is how the operations team sees them.",
    },
    {
      media: recreation("top-up-lists.webp", {
        alt: "Top-up generation screen with store cache status, two stores flagged with failed syncs, a store picker and recent lists with their delivery state",
        title: "Top-up planning",
      }),
      title: "Top-up planning from cached data",
      does: "Generates replenishment lists per store and reserves warehouse stock for them. Each store's cache status is shown up front, and stores whose last sync failed are flagged but can still be planned.",
      why: "A store that is offline still gets restocked, and the planner knows how fresh the data behind the plan is.",
      engineering: "Lists record whether they reached the store; recurring warehouse shortages are tracked separately.",
    },
    {
      media: recreation("top-up-detail.webp", {
        alt: "Top-up list detail with, for each product, positions, current quantity, target, shelf capacity, forecast need, trip planned, warehouse allocated and final delivery",
        title: "Top-up recommendations",
      }),
      title: "Forecast-driven recommendations",
      does: "For each product, shows the current quantity, the forecast target, shelf capacity, warehouse allocation and the final delivery.",
      why: "Every recommended unit can be traced back to the numbers that produced it.",
      engineering: "Generated lists are locked; the calculation parameters are stored with the list.",
    },
    {
      media: recreation("inventory-sync.webp", {
        alt: "Warehouse inventory table with usable warehouse stock, total stock, pending quantities and warehouse, store and expiry warnings, under a store sync status panel",
        title: "Warehouse inventory",
      }),
      title: "Warehouse inventory and sync status",
      does: "Lists warehouse stock with quantities already reserved for top-ups, and warns about low or missing stock and expiring batches. Each store's sync status sits above the table.",
      why: "Purchasing and replenishment decisions start from one view of stock across the warehouse and stores.",
    },
    {
      media: recreation("purchasing.webp", {
        alt: "Purchasing overview with completed purchase orders, requested and received quantities and expiry dates",
        title: "Purchasing",
      }),
      title: "Purchasing and receiving",
      does: "Tracks purchase orders by vendor through to receipt, item by item, with expiry dates.",
      why: "Received stock enters the warehouse with its cost, tax and deposit fixed at that moment.",
    },
    {
      media: recreation("sales-reporting.webp", {
        alt: "Sales overview with totals for products, units, revenue, stores and refunds, and a ranked list of best-selling products",
        title: "Sales",
      }),
      title: "Sales and reporting",
      does: "Ranks products by units sold across stores or for one store, with revenue, stock and refunds; reports export to PDF and CSV.",
      why: "Revenue reconciles to the money actually charged, so the figures can be used for decisions.",
    },
  ],

  deepDives: [
    {
      id: "offline-delivery",
      label: "Offline-safe delivery",
      heading: "When a store goes offline, inventory updates must remain correct.",
      intro: [
        "When a top-up is completed at the office, the units still have to reach the store's database, and the store may be unreachable. Writing to the store inside the request would lose the change whenever the store was down.",
        "So completing a top-up writes the stock changes and a delivery job into the office database in a single transaction: a completed list can never exist without its delivery job. A background worker drains each store's jobs in order. If a store is unreachable, the job stays pending, later jobs for that store wait behind it, and retries back off exponentially.",
        "The changes travel as deltas, \"+4 to position P-12\", not as final quantities. A delta stays correct however long the store was offline and however much it sold in the meantime; a final quantity computed at the office would overwrite those sales.",
        "The hard case is a lost acknowledgement: the store committed the change, but the office never heard back and retries. The store applies each job inside one store transaction that also records a marker keyed by the job's id. A retry that finds the marker settles the office side from the recorded plan and leaves stock alone. Delivery is at-least-once; the stock effect is exactly once, because applying a job is idempotent. There is no distributed transaction across the two databases.",
      ],
      demo: "offline-delivery",
      demoLabel: "Interactive technical demonstration. Synthetic and simplified; not the production system or its data.",
      steps: {
        title: "How a delivery is applied at the store",
        items: [
          "Lock the office delta rows for the job. Edits to a pending delivery take the same locks in the same order, so the two can't interleave.",
          "Open a store transaction and look for the job's marker.",
          "Marker found: the store already committed. Settle the office from the plan stored in the marker and stop.",
          "Otherwise lock the live store positions and plan the placement against them.",
          "Update each position, checking that exactly one row changed.",
          "Insert the marker in the same store transaction, then commit.",
          "Settle the office rows and commit. A crash between the two commits resolves correctly on the next retry.",
          "Units that can't be placed are recorded as issues for follow-up, never dropped silently.",
        ],
      },
      limitations: [
        "Per-store ordering relies on a single backend process draining the queue. Stock deltas stay safe with more than one worker, but other job types could interleave.",
        "The queue's ordering and overlay logic has automated tests; the delta-application path does not yet.",
      ],
    },
    {
      id: "forecasting",
      label: "Forecasting",
      heading: "From sales history to stock recommendations.",
      intro: [
        "A plain average of past sales underestimates demand for exactly the products that matter most. If a product sold out on Thursday and stayed empty until Monday, those days recorded zero sales: not because nobody wanted it, but because there was nothing to buy. Dividing by calendar days bakes the stockout into the forecast, which then orders too little, which causes the next stockout.",
        "The forecast blends several sales windows, weighting recent ones more, and divides each window's sales by the days the product was actually in stock, measured from hourly inventory history. The correction only applies when enough days were observed, and its uplift is capped, because availability sampling is imperfect.",
        "One-off bulk purchases are capped per transaction unless a product shows recurring bulk demand, so a single large basket doesn't inflate the forecast. Variance is never assumed lower than a Poisson process, so slow sellers still get safety stock.",
        "From there it is a periodic-review policy: a reorder point that covers demand until the next visit at a chosen service level, and an order-up-to target covering the visit interval plus a buffer, bounded by shelf capacity. Products are banded by demand, and each band has its own service level. The list is then limited by warehouse availability and by how many units a trip can carry, with the most urgent products filled first.",
        "This is classical statistics and rule-based optimisation, not machine learning.",
      ],
      demo: "forecast-explorer",
      demoLabel: "Interactive demonstration with fictional data and a documented demo policy. Production constants are not shown.",
      steps: {
        title: "The production calculation, step by step",
        items: [
          "Estimate daily demand from several weighted sales windows.",
          "Correct each window for stockouts by dividing by in-stock days, with coverage and uplift guards.",
          "Cap unusual bulk baskets unless bulk buying recurs.",
          "Floor the variance at the mean.",
          "Pick the service level from the product's demand band; convert it to z with an inverse-normal approximation written in-line.",
          "Reorder point = ⌈μR + z√(σ²R)⌉ for R days to the next visit.",
          "Target = ⌈μP + z√(σ²P)⌉ with P = R + buffer, between a minimum facing and shelf capacity.",
          "Top up only when stock is below the reorder point; push stock with expiring warehouse batches.",
          "Ration by days of stock remaining when a trip can't carry everything, and record what was deferred.",
        ],
        collapsed: true,
      },
      limitations: ["The weights, bands and caps are set by hand. They haven't yet been backtested against historical outcomes."],
    },
    {
      id: "integrity",
      label: "Inventory integrity",
      heading: "Preventing stock errors when conditions change.",
      intro: [
        "Plans are made from cached snapshots so that an offline store can still be replenished. A store whose snapshot is old is still planned, with a notice; it is only refused if no snapshot has ever been captured.",
        "That is safe because the plan is treated as a ceiling. When the top-up is completed, the platform re-reads the store's live stock and delivers the smallest of three numbers: what was planned, the room left on the shelf, and the room left below the target. Stale data misses recent sales, so a cached plan errs towards delivering too little rather than overfilling.",
        "Live edits to a position use optimistic concurrency: the browser sends the values it expects, the server locks the row and compares, and a mismatch returns a conflict with the current values instead of overwriting someone else's change. Locks are always taken in the same order, office first and store second, which rules out deadlocks between edits and deliveries.",
        "In the warehouse, stock is reserved first-expiry-first-out when a list is created, skipping expired batches. Editing a list reserves more or releases the excess; completing or cancelling consumes or releases it.",
      ],
      demo: "stock-placement",
      demoLabel: "Interactive technical demonstration. One fictional product; simplified from the production placement logic.",
      limitations: ["Overflow spills to the product's other positions in position order, which is simple but not optimal."],
    },
    {
      id: "financials",
      label: "Financial correctness",
      heading: "Keeping operational reporting consistent with real transactions.",
      intro: [
        "Profit reports are only useful if last month's numbers don't change when this month's prices do. The landed cost of each batch (unit price with tax and deposit) is fixed at goods receipt, using the rates in force then. When stock is delivered to a store, the cost of the batches it came from is frozen into an append-only delivery ledger.",
        "Sales records don't say which batch an item came from, so exact per-unit FIFO isn't possible. Cost of goods is instead matched at the period boundary: for each store and product, units sold before the period are skipped off the front of the ledger, and the period's units consume the next costs in order. This is an approximation. Units the ledger can't cover use a fallback cost, and every report shows what share of units were costed from the ledger.",
        "Revenue is allocated down from the amount the customer was actually charged. List prices and promotion formulas only decide how a basket's total is split between its lines, and the last line absorbs the rounding, so per-product revenue always adds up to the money taken.",
      ],
      demo: "cogs-ledger",
      demoLabel: "Interactive demonstration with fictional figures.",
      steps: {
        title: "The detail behind the numbers",
        items: [
          "Landed cost = unit price × (1 + tax rate) + deposit, with the rates stamped onto the batch at receipt.",
          "Batches with no recorded cost are deliberately not frozen into the ledger, so free-looking stock doesn't overstate profit.",
          "Only sales after a product's first costed delivery are skipped at the period boundary; counting older history would wipe out the ledger.",
          "Discounts applied by the store's own recommendation system are matched to sales by store, product and time, used at most once, and dropped entirely if they don't reconcile with the charged total.",
          "Refunds are split into spoiled, not retrieved, and spoilage write-offs, so net revenue and profit after spoilage are reported separately.",
        ],
        collapsed: true,
      },
      limitations: ["The cost-of-goods and revenue-allocation code doesn't have automated tests yet."],
    },
  ],

  architectureFigure: "inventory-architecture",
  decisions: [
    {
      decision: "Durable outbox instead of writing to stores during the request",
      basis: "verified",
      reason: "Writes made directly to a store were lost whenever that store was unreachable. An outbox row committed with the office change survives until the store comes back.",
      tradeoff: "Stores become eventually consistent with the office, so the interface has to show delivery states: sent, queued or failed.",
    },
    {
      decision: "Stock deltas instead of absolute quantities",
      basis: "verified",
      reason: "\"+4 to P-12\" stays true however long the store was offline and however much it sold meanwhile. An absolute quantity computed at the office would overwrite those sales.",
      tradeoff: "Deltas need placement rules for full, moved or inactive positions, and pending deltas have to be added to cached and live quantities wherever stock is shown.",
    },
    {
      decision: "An idempotency marker instead of a distributed transaction",
      basis: "verified",
      reason: "The office and store databases are independent servers. A marker written in the same store transaction as the stock change makes retries safe without coordinating a two-phase commit.",
      tradeoff: "Each store database carries one extra table, and the protocol has to be reasoned through for every crash point.",
    },
    {
      decision: "Plan from cached snapshots, verify against live stock",
      basis: "verified",
      reason: "Refusing to plan until a store is reachable would block replenishment for exactly the stores that need attention.",
      tradeoff: "Plans can over-request. Completion trims the quantity against live stock and releases the extra warehouse reservation.",
    },
    {
      decision: "Statistical safety stock instead of simple sales averages",
      basis: "verified",
      reason: "Averages are biased low by stockouts and inflated by one-off bulk baskets, and they say nothing about how much buffer variability needs.",
      tradeoff: "More constants to choose, and those constants need empirical validation.",
    },
    {
      decision: "Freeze historical costs instead of recalculating them",
      basis: "verified",
      reason: "A closed period should report the same profit every time it is opened, even after prices or tax rates change.",
      tradeoff: "Correcting a historical cost needs explicit tooling rather than an edit to a price.",
    },
  ],

  capabilities: [
    { name: "Warehouse batches and expiry", what: "Batch-level stock with expiry dates and reserved quantities; empty batches are archived." },
    { name: "Purchase orders and receiving", what: "Orders by vendor, item-by-item receiving with expiry checks and landed costs." },
    { name: "Promotions and pickup codes", what: "Per-store promotions, promo codes reconciled across stores, and pickup codes shared by every store." },
    { name: "Sales reports", what: "Revenue, cost of goods and profit, with refunds and spoilage separated, exported to PDF and CSV." },
    { name: "Store monitoring", what: "A live view across stores, plus each store's sync status and data freshness." },
    { name: "Users and permissions", what: "Role-based access with 40 fine-grained permissions and their dependencies." },
    { name: "Audit logs", what: "Before-and-after records of product, position and stock adjustments in one place." },
  ],
  challenges: [],

  resultsIntro: [
    "The platform is deployed in production and has become the business's primary operational management system. Warehouse stock, store replenishment, purchasing, promotions and sales reporting for the store network all run through it.",
  ],
  outcomes: [
    { kind: "scope", value: "13", label: "automated stores operated from the platform" },
    { kind: "capability", label: "The business's main operations system, in daily production use" },
    { kind: "capability", label: "Replenishment keeps working while stores are offline" },
    { kind: "capability", label: "Store deliveries apply exactly once, even after lost acknowledgements" },
  ],
  nextSteps: [
    { name: "Eventual consistency", what: "Store data in the office is a snapshot. Staleness is surfaced rather than eliminated, and change-data capture from the stores would narrow it." },
    { name: "Forecast validation", what: "Backtest the forecast's weights, bands and caps against historical stockouts and sales." },
    { name: "Test coverage", what: "There are 67 automated tests across the platform and sync service, but delta application, cost of goods and revenue allocation still need direct tests, and nothing yet runs against a real MySQL." },
    { name: "Single-process queue", what: "Move per-store ordering from in-process state to a database lease so more than one backend can drain the queue." },
    { name: "Historical data", what: "Sales from before the cost ledger existed use fallback costs, which is why every report shows its ledger coverage." },
  ],
  lessons: [],

  showcase: "store-sync",
  // Leads the homepage card and the page once the recreations are approved.
  cover: recreation("stock-positions.webp", {
    alt: "Rack layout for an offline store opened from its last known data, with inactive positions holding units",
    title: "Stock positions, store offline",
  }),
  gallery: [],
  links: { demo: null, repo: null },
};
