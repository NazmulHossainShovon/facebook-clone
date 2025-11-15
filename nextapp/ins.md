### Project Overview

You are tasked with building a frontend-only webapp called "Blox Fruits Build Damage Comparator" using Next.js. This app allows users to input details for two different character builds (e.g., stats like Melee, Defense, Fruit, Sword; equipped items like fruits, swords, accessories) and compare their DPS (Damage Per Second) side-by-side. All calculations and logic happen in the frontend—no backend or external APIs.

**Key Requirements:**

- **Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS for styling, React Hook Form for form handling, and any basic React hooks for state management (e.g., useState, useEffect).
- **UI Principles:** Clean, simple, easy to use. Use a minimalistic design with sans-serif fonts, plenty of whitespace, neutral colors (e.g., dark mode optional but keep light by default), and responsive layout (mobile-first). No flashy animations—smooth transitions only where needed (e.g., form validation).
- **Functionality:**
  - Two identical forms side-by-side for Build 1 and Build 2.
  - Each build form includes inputs for: Level (1-2550), Stats (Melee, Defense, Fruit, Sword, Gun—each 0-100% allocation), Equipped Fruit (dropdown with common Blox Fruits like Dragon, Leopard, etc.—use a static list), Sword (dropdown), Accessories (multi-select from a static list).
  - "Compare" button calculates and displays DPS for each build below the forms.
  - DPS calculation: Use a simplified formula based on Blox Fruits mechanics (e.g., Base DPS = (Melee _ 0.5 + Sword _ 0.3 + Fruit _ 0.2) _ Level / 100; adjust for items with multipliers). Make it placeholder-realistic; hardcode multipliers for items.
  - Side-by-side comparison table/chart showing DPS, % difference, strengths/weaknesses.
  - Reset button to clear forms.
- **Pages:** Single page app (`/`) with the comparator. Add a simple landing header.
- **Edge Cases:** Validate inputs (e.g., stats sum to 100%, level in range), show errors inline, disable compare if forms invalid.
- **Deployment Prep:** Ensure it runs with `npm run dev` and builds with `npm run build`.

### Step 2: Define Types and Static Data

1. Create `src/types/build.ts`:
   - Export interface `BuildInput` with: `level: number; stats: { melee: number; defense: number; fruit: number; sword: number; gun: number }; equipped: { fruit: string; sword: string; accessories: string[] }`.
   - Ensure stats sum to 100 via validation later.
2. Create `src/lib/data.ts`:
   - Export const `fruits` = ['None', 'Dragon', 'Leopard', 'Mammoth', 'Kitsune'] as const; // Add 10-15 common ones.
   - Export const `swords` = ['None', 'Tushita', 'Yama', 'Enma', 'Shark Anchor'] as const;
   - Export const `accessories` = ['None', 'Hunter Cape', 'Swan Glasses', 'Leather Cap'] as const; // 8-10 items.
3. Create `src/lib/calculations.ts`:
   - Export function `calculateDPS(build: BuildInput): number`.
   - Placeholder formula: `let base = (build.stats.melee * 0.5 + build.stats.sword * 0.3 + build.stats.fruit * 0.2 + build.stats.gun * 0.1) * (build.level / 100); base *= getItemMultiplier(build.equipped.fruit, build.equipped.sword, build.equipped.accessories); return Math.round(base);`.
   - Define `getItemMultiplier` as a switch/object lookup: e.g., Dragon: 1.5, Tushita: 1.2, accessories add 0.1 each, etc. Keep simple—total multiplier 1.0-3.0.
4. Test:
   - In `app/page.tsx`, import and console.log `calculateDPS({ level: 1000, stats: {melee:25,defense:25,fruit:25,sword:25,gun:0}, equipped:{fruit:'Dragon',sword:'Tushita',accessories:[]}})` in a useEffect.
   - Run dev server, check console for ~expected value (e.g., 1500+).

**Summary to report:** Types and calc logic defined; sample DPS logs in console.

---

### Step 3: Build Reusable Form Components

1. Create `src/components/ui/InputField.tsx`:
   - Simple TSX component: props `{ label: string; name: string; form: any; type?: 'number'|'text'; placeholder?: string }`.
   - Use `<label>`, `<input className="border rounded px-2 py-1 w-full">` with Tailwind, integrate `form.register(name)`.
   - Add error display: `{errors[name] && <p className="text-red-500 text-sm">{errors[name].message}</p>}`.
2. Create `src/components/ui/SelectField.tsx`:
   - Similar to InputField, but `<select>` with options from array prop `{ options: string[] }`.
3. Create `src/components/ui/MultiSelect.tsx`:
   - For accessories: Use checkboxes in a grid. Props `{ options: string[]; form: any; name: string }`. Use `form.watch(name)` for selected values.
4. Create `src/components/BuildForm.tsx`:
   - Props: `{ buildNumber: 1|2; onSubmit: (data: BuildInput) => void }`.
   - Use `useForm<BuildInput>({ resolver: zodResolver(schema) })` where schema = z.object({ level: z.number().min(1).max(2550), stats: z.object({...}).refine(sum===100), equipped: z.object({fruit: z.enum(fruits), sword: z.enum(swords), accessories: z.array(z.enum(accessories))}) }).
   - Layout: `<form className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">` with sections: Level (InputField), Stats (5 InputFields in row, sum validation), Equipped (SelectField for fruit/sword, MultiSelect for accessories).
   - On submit: `handleSubmit(onSubmit)`.
5. Test:
   - In `app/page.tsx`, render `<BuildForm buildNumber={1} onSubmit={console.log} />`. Fill form, submit, check console.

**Summary to report:** Form components built; single form submits data to console without errors.

---

### Step 4: Implement Main Comparator Page

1. Update `app/page.tsx`:
   - Import `BuildForm`, `calculateDPS`, `useState`.
   - State: `const [build1, setBuild1] = useState<BuildInput | null>(null); const [build2, setBuild2] = useState<BuildInput | null>(null); const [comparison, setComparison] = useState<{dps1: number; dps2: number; diff: number} | null>(null);`.
   - JSX: `<div className="container mx-auto py-8 px-4 max-w-6xl"> <h1 className="text-3xl font-bold text-center mb-8">Blox Fruits Build DPS Comparator</h1> <div className="grid md:grid-cols-2 gap-8"> <BuildForm buildNumber={1} onSubmit={setBuild1} /> <BuildForm buildNumber={2} onSubmit={setBuild2} /> </div> {build1 && build2 && <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded mx-auto block" onClick={() => { const dps1 = calculateDPS(build1); const dps2 = calculateDPS(build2); setComparison({dps1, dps2, diff: ((dps1 - dps2)/dps2 * 100)}); }}>Compare DPS</button>} {comparison && <ComparisonTable data={comparison} />} <button className="mt-4 px-6 py-2 bg-gray-500 text-white rounded" onClick={() => {setBuild1(null); setBuild2(null); setComparison(null);}}>Reset</button> </div>`.
2. Ensure responsive: Use Tailwind `md:grid-cols-2` for side-by-side on desktop, stacked on mobile.
3. Add header styling: Centered, clean.

**Summary to report:** Main page layout with forms and compare button; clicking compare logs data.

---

### Step 5: Build Comparison Display

1. Create `src/components/ComparisonTable.tsx`:
   - Props: `{ data: {dps1: number; dps2: number; diff: number} }`.
   - Simple table: `<table className="w-full border-collapse border mt-8"> <thead><tr><th>Build</th><th>DPS</th><th>vs Other</th></tr></thead> <tbody> <tr><td>Build 1</td><td>{data.dps1}</td><td>{data.dps1 > data.dps2 ? '+' : ''}{data.diff.toFixed(1)}%</td></tr> <tr><td>Build 2</td><td>{data.dps2}</td><td>{data.dps2 > data.dps1 ? '+' : ''}{(-data.diff).toFixed(1)}%</td></tr> </tbody> </table>`.
   - Add colors: Green for positive diff, red for negative.
2. Add insights:
   - Below chart: `<p className="mt-4">Insights: {data.dps1 > data.dps2 ? 'Build 1 excels in melee damage.' : 'Build 2 has better fruit scaling.'}</p>` (hardcode simple logic based on stats comparison).

**Summary to report:** Comparison renders table/chart on button click; visually clean.

---

### Step 6: Polish UI, Validation, and Testing

2. Form validation:
   - In schema, add `stats: z.object({}).refine((val) => Object.values(val).reduce((a,b)=>a+b,0) === 100, {message: 'Stats must sum to 100%'})`.
   - Show global error in BuildForm: `{form.formState.errors.root && <p className="text-red-500">{form.formState.errors.root.message}</p>}`.
   - Disable compare button if !build1 || !build2.
3. Responsiveness:
   - Test on mobile: Forms stack, table scrolls horizontally if needed (add `overflow-x-auto`).
4. Sample data:
   - Add a "Load Sample" button per form to prefill (e.g., setBuild1(sampleBuild)).

**Summary to report:** App polished, validated, tested. Ready for use.

---
