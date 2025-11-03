# Responsive Design Documentation

This document details the responsive behavior of the BalatroBench leaderboard tables across different screen sizes.

## Tailwind CSS Breakpoints

The application uses standard Tailwind CSS breakpoints:

| Breakpoint | Min Width | Description |
|------------|-----------|-------------|
| (default)  | 0px       | Mobile devices |
| `sm`       | 640px     | Small tablets |
| `md`       | 768px     | Tablets |
| `lg`       | 1024px    | Laptops |
| `xl`       | 1280px    | Desktops |

## Index.html - Main Leaderboard

### Column Visibility by Screen Size

| Column | Icon | Mobile | sm (640px+) | md (768px+) | lg (1024px+) | xl (1280px+) |
|--------|------|--------|-------------|-------------|--------------|--------------|
| Rank (#) | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Model | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vendor | - | ✗ | ✗ | ✗ | ✗ | ✓ |
| Round | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Valid tool calls | ✓🔧 | ✗ | ✓ | ✓ | ✓ | ✓ |
| Invalid tool calls | ⚠️🔧 | ✗ | ✓ | ✓ | ✓ | ✓ |
| Error responses | ❌🔧 | ✗ | ✓ | ✓ | ✓ | ✓ |
| Input tokens | In💾/🔧 | ✗ | ✗ | ✗ | ✓ | ✓ |
| Output tokens | Out💾/🔧 | ✗ | ✗ | ✗ | ✓ | ✓ |
| Time per call | ⏰/🔧 [s] | ✗ | ✗ | ✓ | ✓ | ✓ |
| Cost per call | 💲/🔧 [m$] | ✗ | ✗ | ✓ | ✓ | ✓ |

### Responsive Behavior Summary

**Mobile (< 640px):**
- Shows only essential columns: Rank, Model, Round
- Minimal view for quick performance comparison

**Small tablets (640px - 767px):**
- Adds tool call reliability metrics (3 columns)
- Users can assess model reliability

**Tablets (768px - 1023px):**
- Adds performance metrics: Time and Cost per tool call
- Comprehensive view of model efficiency

**Laptops (1024px - 1279px):**
- Adds token usage metrics (Input/Output tokens)
- Full performance and resource usage visibility

**Desktops (1280px+):**
- Adds Vendor column
- Complete dataset with all available information

## Community.html - Community Strategies

### Column Visibility by Screen Size

| Column | Icon | Mobile | sm (640px+) | md (768px+) | lg (1024px+) | xl (1280px+) |
|--------|------|--------|-------------|-------------|--------------|--------------|
| Rank (#) | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Author | - | ✗ | ✗ | ✗ | ✓ | ✓ |
| Strategy | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Round | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Valid tool calls | ✓🔧 | ✗ | ✓ | ✓ | ✓ | ✓ |
| Invalid tool calls | ⚠️🔧 | ✗ | ✓ | ✓ | ✓ | ✓ |
| Error responses | ❌🔧 | ✗ | ✓ | ✓ | ✓ | ✓ |
| Input tokens | In💾/🔧 | ✗ | ✗ | ✗ | ✓ | ✓ |
| Output tokens | Out💾/🔧 | ✗ | ✗ | ✗ | ✓ | ✓ |
| Time per call | ⏰/🔧 [s] | ✗ | ✗ | ✓ | ✓ | ✓ |
| Cost per call | 💲/🔧 [m$] | ✗ | ✗ | ✓ | ✓ | ✓ |

### Responsive Behavior Summary

**Mobile (< 640px):**
- Shows only essential columns: Rank, Strategy, Round
- Focus on strategy name and performance

**Small tablets (640px - 767px):**
- Adds tool call reliability metrics (3 columns)
- Strategy reliability assessment enabled

**Tablets (768px - 1023px):**
- Adds performance metrics: Time and Cost per tool call
- Efficiency comparison between strategies

**Laptops (1024px - 1279px):**
- Adds Author column and token usage metrics
- Full attribution and resource usage visibility

**Desktops (1280px+):**
- No additional columns (same as laptop view)
- Complete dataset with all available information

## Key Differences Between Pages

| Feature | Index.html | Community.html |
|---------|------------|----------------|
| Secondary identifier | Vendor (xl+ only) | Author (lg+ only) |
| Vendor column threshold | 1280px+ | N/A |
| Author column threshold | N/A | 1024px+ |
| Additional chart | Performance bar chart (lg+) | None |

## Design Patterns

### Progressive Disclosure
Both pages follow a mobile-first approach with progressive disclosure:
1. **Core metrics first**: Rank and performance (Round) always visible
2. **Reliability next**: Tool call metrics at small screens
3. **Efficiency follows**: Performance metrics at medium screens
4. **Resources last**: Token usage at large screens
5. **Attribution finally**: Vendor/Author at largest screens

### Visual Hierarchy
- **Border separators** (`border-l-2`): Used to visually group column sections
  - Stats section (Round)
  - Tool calls section
  - Tokens section
  - Performance section

### Accessibility
- All columns use `aria-label` attributes for icon-based headers
- Screen reader text provided via `.sr-only` class
- Semantic HTML with proper `scope` attributes on table headers

## Additional Responsive Features

### Performance Bar Chart (index.html only)
- Hidden on mobile/tablet: `hidden lg:block`
- Visible from 1024px+
- Height: 250px fixed
- Shows model comparison with rounds reached

### Interactive Row Expansion
- Available on desktop sizes (lg+)
- Shows detailed statistics including:
  - Round distribution histogram
  - Provider usage pie chart
  - Per-game statistics table
  - Total aggregated metrics

### Navigation
- Responsive navigation bar on all pages
- Adjustable button widths: `w-28 sm:w-32 md:w-36 lg:w-40`
- Horizontal padding adjusts: `px-2 xl:px-4`
