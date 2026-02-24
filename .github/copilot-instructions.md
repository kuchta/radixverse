# RadixVerse - AI Coding Agent Instructions

## Project Overview
**RadixVerse** is an interactive React + TypeScript web application for exploring alternative number systems and bases. It allows users to visualize and convert numbers across 6 distinct mathematical systems (standard, bijective, balanced, clock, sum, balsum) with support for radixes 2-35.

## Architecture

### Core System: Number Systems (src/utils.ts)
The heart of the app is the `Radix` type - a configuration object for each number system that encodes:
- Character set mapping (0-9, A-Z, or Unicode symbols like ➒, 🅩)
- Low/high value ranges for each system
- Conversion functions: `num2str()` (number→string), `str2num()` (string→number)

**Key insight:** Each radix system has different arithmetic rules:
- **Standard**: 0 to radix-1 (normal base conversion)
- **Bijective**: 1 to radix (no zero; uses only 1 character)
- **Balanced**: Negative to positive around zero (e.g., base-3 balanced uses -1,0,1)
- **Clock**: Symmetric around zero with negative representation (used for hour-like notation)
- **Sum**: Positional system using addition instead of multiplication (powers of r as multipliers)
- **Balsum**: Hybrid balanced+sum system

### UI Component Hierarchy
```
App (src/app.tsx)
├── Router + useStore (manages radixes, enabled radixes, value from URL params)
├── Header (radix editor)
├── Tabs navigation
└── Route components (Show, Add, Multiply, Convert)
    └── Table/Tables (src/components/Table.tsx)
        └── renderValue (color coding by HSL hue based on value range)
```

**Key pattern:** All route components receive `enabledRadixes` and generate table data locally via `computeProps()` - the app doesn't use global state management.

### Data Persistence
- **localStorage** keys: `theme`, `chars`, `radixes`
- **URL parameters**: `?r=base2&r=base10&value=42&radix=base10` preserves state across sessions
- Error handling: JSON parse failures in localStorage fallback silently and trigger error toast

## Development Workflows

### Build & Serve
```bash
npm start        # Vite dev server on port 10000 with HMR
npm run build    # Production build with sourcemaps (vite build)
npm run preview  # Serve production build on port 10000
npm run check    # TypeScript type checking (strict mode)
npm run lint     # ESLint on src/ with styled eslint-plugin
npm test         # Node native test runner (src/**/*.test.ts)
npm run pre-commit  # Check + Lint + Test + Build (CI equivalent)
```

**Pre-commit hook equivalent:** Use `npm run pre-commit` before pushing.

### Quality Standards
- **TypeScript**: Strict mode enabled; ESNext target; JSX via React 19 compiler
- **Linting**: ESLint 9 with @stylistic/eslint-plugin; Biome parser for CSS with Tailwind directives
- **Testing**: Native Node.js test runner (src/**/*.test.ts); example in src/utils.test.ts
- **Styling**: TailwindCSS v4 with DaisyUI components; source in src/app.css

## Key Conventions

### Number Conversion Pattern
**Always use BigInt for arithmetic** - the Radix type stores values as `bigint` because JavaScript's `Number` overflows above 2^53.

```typescript
// ✓ Correct: Handle conversion via Radix methods
const num: bigint = 42n;
const str = num2str(num, radix);
const back: bigint = str2num(str, radix);

// ✗ Avoid: Direct number operations with large values
const val = 999999999999999999; // Loses precision
```

### Component Props Pattern
Route components (Add, Multiply, Convert) receive `radixes: Radix[]` and compute derived state locally:

```typescript
const [ props, setProps ] = useState(computeProps(radix));
useEffect(() => setProps(computeProps(radix, columns, rows)), [ radix, columns, rows ]);
```

This avoids prop drilling and keeps table layout computation close to rendering.

### Error Handling
- **Parser errors**: Catch, log, and call `updateError()` to show toast (10s auto-dismiss)
- **Invalid input**: Sanitize via `sanitizeInput()` and throw with `allowedCharaters(radix)` message
- **Missing radix in URL**: Throw error with helpful context (currently checked in app.tsx)

### localStorage Serialization
Only serialize safe fields (name, radix, system, chars, enabled) - omit Maps and computed fields:

```typescript
const rs = radixes.map(r => ({
  name: r.name,
  radix: Number(r.radix),  // BigInt → Number for JSON
  system: r.system,
  chars: r.chars,
  enabled: r.enabled
}));
```

Deserialization reconstructs Maps via `createRadix()`.

## Integration Points

### Radix Creation
- `createRadixes(chars)` - generates all 35 radixes (radix 2-36) with default enabled set
- `createRadix(num, system, chars, enabled, name)` - single radix with validation
- **Validation**: System+radix combos have constraints (balanced/sum must be odd, clock even)

### Character Sets
- Default: 71-char balanced set (`baseBal71`) = -26 to 26 (Unicode symbols) + 0 + 1-9 + A-Z
- Custom: Set via `setCharsLS()`, retrieved for Radix creation
- **Constraint**: Custom char sets must have odd length and ≥ 71 chars for default radixes

### URL State Recovery
App.tsx `useEffect` runs once to:
1. Detect `?clear-settings` → wipe localStorage
2. Parse `?r=...` params → set enabled radixes
3. Parse `?radix=...` → set working radix
4. Parse `?value=...` → set initial number for conversion

**Order matters:** Radix must be set before parsing value to avoid "Unknown radix" errors.

## Testing & Debugging

### Test Utils
- `src/utils.test.ts` - examples of num2str, str2num, edge cases
- **NaN handling**: `renderValue()` returns empty span for NaN values

### Common Issues
- **Color encoding**: HSL hue = `(val - low) / space * 300` (maps range to 300° color wheel)
- **Table dimensions**: `columns = high - low + 1`; `rows = columns + (bijective ? 1 : 0)`
- **Overflow**: Use `Number.isNaN()` to detect overflow before rendering

## File Reference
- [src/utils.ts](../src/utils.ts) - All number system logic, serialization
- [src/app.tsx](../src/app.tsx) - Router, URL params, useStore hook
- [src/components/Table.tsx](../src/components/Table.tsx) - Rendering logic, color mapping
- [src/components/Show.tsx](../src/components/Show.tsx) - Example of `computeProps()` pattern
- [vite.config.ts](../vite.config.ts) - PWA plugin, React compiler, Tailwind
- [biome.json](../biome.json) - Linter rules (ESNext, no exhaustive deps, allow non-null assertions)
