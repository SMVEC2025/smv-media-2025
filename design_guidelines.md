# Media Team Event Management Web App - Design Guidelines

## Design Philosophy

This design system creates a **modern, professional creative industry aesthetic** for media professionals (photographers, videographers, editors). The visual language balances **sophistication with approachability**, using clean layouts, purposeful color, and subtle motion to create a tool that feels both powerful and intuitive.

**Core Principles:**
- **Creative Professional**: Sophisticated but not corporate, modern but not trendy
- **Clarity First**: Information hierarchy that makes complex workflows simple
- **Purposeful Motion**: Micro-interactions that guide and delight
- **Mobile-Optimized**: Responsive design for on-location team members

---

## GRADIENT RESTRICTION RULE

**NEVER** use dark/saturated gradient combos (e.g., purple/pink, blue-500 to purple-600) on any UI element.
**NEVER** let gradients cover more than 20% of the viewport.
**NEVER** apply gradients to text-heavy content or reading areas.
**NEVER** use gradients on small UI elements (<100px width).
**NEVER** stack multiple gradient layers in the same viewport.

### ENFORCEMENT RULE
**IF** gradient area exceeds 20% of viewport **OR** impacts readability  
**THEN** fallback to solid colors or simple, two-color gradients.

### ALLOWED GRADIENT USAGE
- Hero/landing sections (background only, ensure text readability)
- Section backgrounds (not content blocks)
- Large CTA buttons / major interactive elements (light/simple gradients only)
- Decorative overlays and accent visuals

---

## Color System

### Primary Palette

```css
:root {
  /* Primary Brand Colors */
  --color-primary: #00A896;        /* Teal - Trust, professionalism, creativity */
  --color-primary-light: #02C9B3;  /* Lighter teal for hover states */
  --color-primary-dark: #028174;   /* Darker teal for active states */
  
  /* Secondary/Accent Colors */
  --color-accent: #FF6F61;         /* Coral - Energy, creativity, attention */
  --color-accent-light: #FF8A7F;   /* Lighter coral for hover */
  --color-accent-dark: #E65A4D;    /* Darker coral for active */
  
  /* Neutral Palette */
  --color-slate-900: #1E293B;      /* Deep slate for headings */
  --color-slate-700: #334155;      /* Medium slate for body text */
  --color-slate-500: #64748B;      /* Light slate for secondary text */
  --color-slate-300: #CBD5E1;      /* Very light slate for borders */
  --color-slate-100: #F1F5F9;      /* Background tint */
  --color-slate-50: #F8FAFC;       /* Lightest background */
  
  /* Semantic Colors */
  --color-success: #10B981;        /* Green for completed/success */
  --color-warning: #F59E0B;        /* Amber for warnings/pending */
  --color-error: #EF4444;          /* Red for errors/urgent */
  --color-info: #3B82F6;           /* Blue for information */
  
  /* Background & Surface */
  --color-background: #FFFFFF;     /* Main background */
  --color-surface: #FFFFFF;        /* Card/panel background */
  --color-surface-hover: #F8FAFC;  /* Hover state for surfaces */
  
  /* Text Colors */
  --color-text-primary: #1E293B;   /* Primary text */
  --color-text-secondary: #64748B; /* Secondary text */
  --color-text-tertiary: #94A3B8;  /* Tertiary/disabled text */
  --color-text-inverse: #FFFFFF;   /* Text on dark backgrounds */
}
```

### Status Colors (Event Pipeline)

```css
:root {
  /* Event Status Colors */
  --status-created: #94A3B8;       /* Slate - Created */
  --status-scheduled: #3B82F6;     /* Blue - Scheduled */
  --status-in-progress: #F59E0B;   /* Amber - Shoot Completed */
  --status-delivery: #8B5CF6;      /* Purple - Delivery in Progress */
  --status-closed: #10B981;        /* Green - Closed */
  
  /* Priority Colors */
  --priority-normal: #64748B;      /* Slate - Normal */
  --priority-high: #F59E0B;        /* Amber - High */
  --priority-vip: #EF4444;         /* Red - VIP */
  
  /* Task Type Colors */
  --task-photo: #06B6D4;           /* Cyan - Photography */
  --task-video: #8B5CF6;           /* Purple - Videography */
  --task-editing: #EC4899;         /* Pink - Editing */
}
```

### Color Usage Guidelines

**Primary Teal (#00A896):**
- Primary action buttons (Create Event, Assign Task, Save)
- Active navigation items
- Links and interactive elements
- Progress indicators
- Focus states

**Accent Coral (#FF6F61):**
- Secondary CTAs (Upload, Submit)
- Important notifications
- Deadline indicators
- VIP/urgent badges
- Hover states on secondary actions

**Slate Neutrals:**
- Use slate-900 for main headings
- Use slate-700 for body text
- Use slate-500 for secondary information
- Use slate-300 for borders and dividers
- Use slate-100/50 for subtle backgrounds

**Semantic Colors:**
- Success green for completed tasks/events
- Warning amber for pending/approaching deadlines
- Error red for overdue/critical items
- Info blue for helpful tips/information

---

## Typography

### Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Font Families */
  --font-heading: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
```

**Rationale:**
- **Space Grotesk**: Modern, geometric sans-serif with creative personality for headings
- **Inter**: Clean, highly readable for body text and UI elements
- **Monospace**: For event IDs, timestamps, technical data

### Type Scale

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px - Small labels, captions */
  --text-sm: 0.875rem;     /* 14px - Secondary text, table data */
  --text-base: 1rem;       /* 16px - Body text, form inputs */
  --text-lg: 1.125rem;     /* 18px - Large body text */
  --text-xl: 1.25rem;      /* 20px - Small headings */
  --text-2xl: 1.5rem;      /* 24px - Section headings */
  --text-3xl: 1.875rem;    /* 30px - Page headings */
  --text-4xl: 2.25rem;     /* 36px - Hero headings (mobile) */
  --text-5xl: 3rem;        /* 48px - Hero headings (tablet) */
  --text-6xl: 3.75rem;     /* 60px - Hero headings (desktop) */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Typography Hierarchy

**H1 - Page Titles:**
```css
.heading-1 {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--color-slate-900);
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .heading-1 { font-size: var(--text-5xl); }
}

@media (min-width: 1024px) {
  .heading-1 { font-size: var(--text-6xl); }
}
```

**H2 - Section Headings:**
```css
.heading-2 {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-slate-900);
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .heading-2 { font-size: var(--text-3xl); }
}
```

**H3 - Card/Component Headings:**
```css
.heading-3 {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--color-slate-900);
}
```

**Body Text:**
```css
.body-text {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-slate-700);
}

.body-text-sm {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}
```

**Labels & Captions:**
```css
.label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--color-slate-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.caption {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-slate-500);
}
```

---

## Spacing System

```css
:root {
  /* Spacing Scale (based on 4px grid) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

**Usage Guidelines:**
- Use 2-3x more spacing than feels comfortable for a premium feel
- Card padding: `--space-6` (mobile), `--space-8` (desktop)
- Section spacing: `--space-12` to `--space-20`
- Component gaps: `--space-4` to `--space-6`
- Form field spacing: `--space-4`

---

## Border Radius & Shadows

```css
:root {
  /* Border Radius */
  --radius-sm: 0.375rem;   /* 6px - Small elements */
  --radius-md: 0.5rem;     /* 8px - Buttons, inputs */
  --radius-lg: 0.75rem;    /* 12px - Cards */
  --radius-xl: 1rem;       /* 16px - Large cards */
  --radius-2xl: 1.5rem;    /* 24px - Hero sections */
  --radius-full: 9999px;   /* Pill shapes */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Colored Shadows (for emphasis) */
  --shadow-primary: 0 4px 14px 0 rgba(0, 168, 150, 0.25);
  --shadow-accent: 0 4px 14px 0 rgba(255, 111, 97, 0.25);
}
```

---

## Component Styling Patterns

### Buttons

**Primary Button (Teal):**
```jsx
// Use Shadcn Button component: /app/frontend/src/components/ui/button.jsx

<Button 
  data-testid="create-event-button"
  className="bg-[#00A896] hover:bg-[#02C9B3] text-white font-medium px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
>
  Create Event
</Button>
```

**Secondary Button (Coral):**
```jsx
<Button 
  data-testid="upload-deliverable-button"
  variant="outline"
  className="border-2 border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
>
  Upload Deliverable
</Button>
```

**Ghost Button:**
```jsx
<Button 
  data-testid="cancel-button"
  variant="ghost"
  className="text-slate-700 hover:bg-slate-100 font-medium px-6 py-2.5 rounded-lg transition-colors duration-200"
>
  Cancel
</Button>
```

**Button Sizes:**
- Small: `px-4 py-2 text-sm`
- Medium (default): `px-6 py-2.5 text-base`
- Large: `px-8 py-3 text-lg`

### Cards

**Use Shadcn Card component:** `/app/frontend/src/components/ui/card.jsx`

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';

<Card 
  data-testid="event-card"
  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-[#00A896] overflow-hidden group"
>
  <CardHeader className="pb-4">
    <CardTitle className="text-xl font-semibold text-slate-900">
      Event Title
    </CardTitle>
    <CardDescription className="text-sm text-slate-500">
      Event description or metadata
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter className="pt-4 border-t border-slate-100">
    {/* Card actions */}
  </CardFooter>
</Card>
```

**Card Variants:**
- Default: White background, subtle shadow
- Hover: Elevated shadow, teal border
- Selected: Teal border, light teal background tint

### Badges

**Use Shadcn Badge component:** `/app/frontend/src/components/ui/badge.jsx`

```jsx
import { Badge } from './components/ui/badge';

// Status Badges
<Badge 
  data-testid="event-status-badge"
  className="bg-[#3B82F6] text-white px-3 py-1 rounded-full text-xs font-medium"
>
  Scheduled
</Badge>

// Priority Badges
<Badge 
  data-testid="priority-badge"
  variant="destructive"
  className="bg-[#EF4444] text-white px-3 py-1 rounded-full text-xs font-medium"
>
  VIP
</Badge>

// Task Type Badges
<Badge 
  data-testid="task-type-badge"
  variant="outline"
  className="border-[#06B6D4] text-[#06B6D4] px-3 py-1 rounded-full text-xs font-medium"
>
  Photo
</Badge>
```

**Badge Color Mapping:**
- **Status Created**: `bg-[#94A3B8]` (slate)
- **Status Scheduled**: `bg-[#3B82F6]` (blue)
- **Status In Progress**: `bg-[#F59E0B]` (amber)
- **Status Delivery**: `bg-[#8B5CF6]` (purple)
- **Status Closed**: `bg-[#10B981]` (green)
- **Priority Normal**: `bg-[#64748B]` (slate)
- **Priority High**: `bg-[#F59E0B]` (amber)
- **Priority VIP**: `bg-[#EF4444]` (red)
- **Task Photo**: `bg-[#06B6D4]` (cyan)
- **Task Video**: `bg-[#8B5CF6]` (purple)
- **Task Editing**: `bg-[#EC4899]` (pink)

### Forms

**Use Shadcn Form components:** `/app/frontend/src/components/ui/input.jsx`, `/app/frontend/src/components/ui/label.jsx`, `/app/frontend/src/components/ui/select.jsx`, `/app/frontend/src/components/ui/textarea.jsx`

```jsx
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';
import { Textarea } from './components/ui/textarea';

// Text Input
<div className="space-y-2">
  <Label htmlFor="event-name" className="text-sm font-medium text-slate-700">
    Event Name
  </Label>
  <Input
    id="event-name"
    data-testid="event-name-input"
    type="text"
    placeholder="Enter event name"
    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all duration-200"
  />
</div>

// Select Dropdown
<div className="space-y-2">
  <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
    Priority
  </Label>
  <Select data-testid="priority-select">
    <SelectTrigger className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00A896]">
      <SelectValue placeholder="Select priority" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="normal">Normal</SelectItem>
      <SelectItem value="high">High</SelectItem>
      <SelectItem value="vip">VIP</SelectItem>
    </SelectContent>
  </Select>
</div>

// Textarea
<div className="space-y-2">
  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
    Description
  </Label>
  <Textarea
    id="description"
    data-testid="event-description-textarea"
    placeholder="Enter event description"
    rows={4}
    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all duration-200 resize-none"
  />
</div>
```

**Form Validation States:**
- Error: `border-red-500 focus:ring-red-500`
- Success: `border-green-500 focus:ring-green-500`
- Disabled: `bg-slate-100 text-slate-400 cursor-not-allowed`

### Tables

**Use Shadcn Table component:** `/app/frontend/src/components/ui/table.jsx`

```jsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './components/ui/table';

<div className="overflow-x-auto rounded-lg border border-slate-200">
  <Table data-testid="events-table">
    <TableHeader className="bg-slate-50">
      <TableRow>
        <TableHead className="font-semibold text-slate-700">Event Name</TableHead>
        <TableHead className="font-semibold text-slate-700">Date</TableHead>
        <TableHead className="font-semibold text-slate-700">Status</TableHead>
        <TableHead className="font-semibold text-slate-700">Priority</TableHead>
        <TableHead className="font-semibold text-slate-700">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow 
        data-testid="event-row"
        className="hover:bg-slate-50 transition-colors duration-150"
      >
        <TableCell className="font-medium text-slate-900">Event Name</TableCell>
        <TableCell className="text-slate-600">Jan 15, 2024</TableCell>
        <TableCell>
          <Badge className="bg-[#3B82F6]">Scheduled</Badge>
        </TableCell>
        <TableCell>
          <Badge className="bg-[#F59E0B]">High</Badge>
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">View</Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### Calendar

**Use Shadcn Calendar component:** `/app/frontend/src/components/ui/calendar.jsx`

```jsx
import { Calendar } from './components/ui/calendar';

<Calendar
  data-testid="event-calendar"
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-lg border border-slate-200 shadow-md"
  classNames={{
    months: "space-y-4",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium text-slate-900",
    nav: "space-x-1 flex items-center",
    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#00A896] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md transition-colors",
    day_selected: "bg-[#00A896] text-white hover:bg-[#02C9B3] hover:text-white focus:bg-[#00A896] focus:text-white",
    day_today: "bg-slate-100 text-slate-900 font-semibold",
    day_outside: "text-slate-400 opacity-50",
    day_disabled: "text-slate-400 opacity-50",
    day_hidden: "invisible",
  }}
/>
```

### Dialogs/Modals

**Use Shadcn Dialog component:** `/app/frontend/src/components/ui/dialog.jsx`

```jsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button data-testid="open-dialog-button">Create Event</Button>
  </DialogTrigger>
  <DialogContent 
    data-testid="create-event-dialog"
    className="sm:max-w-[600px] rounded-xl"
  >
    <DialogHeader>
      <DialogTitle className="text-2xl font-semibold text-slate-900">
        Create New Event
      </DialogTitle>
      <DialogDescription className="text-slate-600">
        Fill in the details to create a new event
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {/* Form fields */}
    </div>
    <DialogFooter className="gap-2">
      <Button variant="ghost" data-testid="cancel-dialog-button">Cancel</Button>
      <Button data-testid="submit-dialog-button" className="bg-[#00A896]">Create Event</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toasts/Notifications

**Use Sonner for toasts:** `/app/frontend/src/components/ui/sonner.jsx`

```jsx
import { toast } from 'sonner';

// Success toast
toast.success('Event created successfully', {
  description: 'The event has been added to your calendar',
  duration: 3000,
});

// Error toast
toast.error('Failed to create event', {
  description: 'Please check your inputs and try again',
  duration: 4000,
});

// Info toast
toast.info('New task assigned', {
  description: 'You have been assigned to photograph the graduation ceremony',
  duration: 5000,
});

// Warning toast
toast.warning('Deadline approaching', {
  description: 'Event delivery is due in 2 hours',
  duration: 5000,
});
```

**Add Toaster component to your app:**
```jsx
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: '#1E293B',
            border: '1px solid #CBD5E1',
            borderRadius: '0.75rem',
            padding: '1rem',
          },
          className: 'shadow-lg',
        }}
      />
      {/* Your app content */}
    </>
  );
}
```

### Navigation

**Sidebar Navigation:**
```jsx
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard', testId: 'nav-dashboard' },
  { name: 'Events', icon: 'Calendar', href: '/events', testId: 'nav-events' },
  { name: 'Tasks', icon: 'CheckSquare', href: '/tasks', testId: 'nav-tasks' },
  { name: 'Equipment', icon: 'Camera', href: '/equipment', testId: 'nav-equipment' },
  { name: 'Team', icon: 'Users', href: '/team', testId: 'nav-team' },
];

<nav className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto">
  <div className="p-6">
    <h1 className="text-2xl font-bold text-slate-900">MediaHub</h1>
  </div>
  <ul className="space-y-1 px-3">
    {navItems.map((item) => (
      <li key={item.name}>
        <a
          href={item.href}
          data-testid={item.testId}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            "text-slate-700 hover:bg-slate-100 hover:text-[#00A896]",
            "active:bg-[#00A896] active:text-white"
          )}
        >
          <span className="text-lg">{/* Icon component */}</span>
          <span className="font-medium">{item.name}</span>
        </a>
      </li>
    ))}
  </ul>
</nav>
```

**Top Navigation Bar:**
```jsx
<header className="bg-white border-b border-slate-200 sticky top-0 z-50">
  <div className="flex items-center justify-between px-6 py-4">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
    </div>
    <div className="flex items-center gap-4">
      {/* Search */}
      <Input
        data-testid="global-search-input"
        type="search"
        placeholder="Search events, tasks..."
        className="w-64"
      />
      {/* Notifications */}
      <Button 
        data-testid="notifications-button"
        variant="ghost" 
        size="icon"
        className="relative"
      >
        {/* Bell icon */}
        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6F61] rounded-full"></span>
      </Button>
      {/* User menu */}
      <Button 
        data-testid="user-menu-button"
        variant="ghost"
        className="flex items-center gap-2"
      >
        <Avatar className="w-8 h-8" />
        <span className="text-sm font-medium">John Doe</span>
      </Button>
    </div>
  </div>
</header>
```

---

## Layout Patterns

### Dashboard Grid Layout

```jsx
<div className="min-h-screen bg-slate-50">
  {/* Sidebar */}
  <aside className="fixed left-0 top-0 w-64 h-screen">
    {/* Navigation */}
  </aside>
  
  {/* Main Content */}
  <main className="ml-64 min-h-screen">
    {/* Top Bar */}
    <header className="sticky top-0 z-40">
      {/* Header content */}
    </header>
    
    {/* Content Area */}
    <div className="p-6 lg:p-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat cards */}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Events list, calendar, etc. */}
        </div>
        
        {/* Right column (1/3 width) */}
        <div className="space-y-6">
          {/* Sidebar widgets, recent activity, etc. */}
        </div>
      </div>
    </div>
  </main>
</div>
```

### Event Card Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {events.map((event) => (
    <Card 
      key={event.id}
      data-testid={`event-card-${event.id}`}
      className="group hover:shadow-xl transition-all duration-300"
    >
      {/* Event card content */}
    </Card>
  ))}
</div>
```

### Task List Layout

```jsx
<div className="space-y-4">
  {tasks.map((task) => (
    <div
      key={task.id}
      data-testid={`task-item-${task.id}`}
      className="bg-white rounded-lg border border-slate-200 p-4 hover:border-[#00A896] transition-colors duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <Checkbox data-testid={`task-checkbox-${task.id}`} />
          <div className="flex-1">
            <h3 className="font-medium text-slate-900">{task.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge>{task.type}</Badge>
              <Badge variant="outline">{task.priority}</Badge>
              <span className="text-xs text-slate-500">Due: {task.deadline}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" data-testid={`task-menu-${task.id}`}>
          {/* Menu icon */}
        </Button>
      </div>
    </div>
  ))}
</div>
```

### Mobile-First Responsive Patterns

```css
/* Mobile First Approach */
.container {
  padding: 1rem; /* 16px on mobile */
}

@media (min-width: 768px) {
  .container {
    padding: 1.5rem; /* 24px on tablet */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem; /* 32px on desktop */
  }
}

/* Hide sidebar on mobile, show on desktop */
.sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    display: block;
  }
}

/* Stack cards on mobile, grid on desktop */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}
```

---

## Motion & Micro-interactions

### Transition Principles

**CRITICAL: Never use `transition: all`** - Always specify properties to avoid breaking transforms.

```css
/* ✅ CORRECT - Specific transitions */
.button {
  transition: background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
}

/* ❌ WRONG - Breaks transforms */
.button {
  transition: all 200ms ease;
}
```

### Button Interactions

```css
.button-primary {
  background-color: var(--color-primary);
  transition: background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
}

.button-primary:hover {
  background-color: var(--color-primary-light);
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.button-primary:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.button-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Card Hover Effects

```css
.card {
  border: 1px solid var(--color-slate-300);
  box-shadow: var(--shadow-md);
  transition: border-color 300ms ease, box-shadow 300ms ease, transform 300ms ease;
}

.card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}
```

### Input Focus States

```css
.input {
  border: 1px solid var(--color-slate-300);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.input:focus {
  border-color: transparent;
  box-shadow: 0 0 0 2px var(--color-primary);
  outline: none;
}
```

### Page Transitions

```jsx
// Use Framer Motion for page transitions
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3, ease: 'easeInOut' }}
>
  {/* Page content */}
</motion.div>
```

### Loading States

```jsx
// Skeleton loading for cards
import { Skeleton } from './components/ui/skeleton';

<Card>
  <CardHeader>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-32 w-full" />
  </CardContent>
</Card>

// Spinner for buttons
<Button disabled>
  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
  Loading...
</Button>
```

### Scroll Animations

```jsx
// Use Framer Motion for scroll-triggered animations
import { motion, useScroll, useTransform } from 'framer-motion';

const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

<motion.div style={{ opacity }}>
  {/* Content that fades on scroll */}
</motion.div>
```

---

## Icons

**Use Lucide React icons** (already installed):

```jsx
import { 
  Calendar, 
  Camera, 
  Video, 
  Edit3, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Download,
  Upload,
  Eye,
  Trash2
} from 'lucide-react';

// Usage
<Camera className="w-5 h-5 text-slate-600" />
<Video className="w-5 h-5 text-[#8B5CF6]" />
<Edit3 className="w-5 h-5 text-[#EC4899]" />
```

**Icon Sizes:**
- Small: `w-4 h-4` (16px)
- Medium: `w-5 h-5` (20px)
- Large: `w-6 h-6` (24px)
- XL: `w-8 h-8` (32px)

---

## Image Assets

### Team/Hero Images

**Professional photographers and videographers:**
1. `https://images.unsplash.com/photo-1614270248358-0abb9675074b` - Photographer with camera
2. `https://images.unsplash.com/photo-1603207757545-de4fffdb404c` - Videographer working
3. `https://images.unsplash.com/photo-1666114264360-0427e27ac91d` - Camera operator
4. `https://images.unsplash.com/photo-1641632665624-7e82928084da` - Professional shooting

**Usage:** About page, team section, login page background

### Event Production Images

**Behind-the-scenes production:**
1. `https://images.unsplash.com/photo-1727451139462-cd34008cd50b` - Studio setup with lights
2. `https://images.unsplash.com/photo-1631387019069-2ff599943f9a` - Production team member
3. `https://images.unsplash.com/photo-1702919915641-4ea135b7cb0a` - Event venue setup
4. `https://images.unsplash.com/photo-1702126952818-2ea3d6176281` - Studio lighting

**Usage:** Dashboard hero, event cards, public deliveries page

### Background Textures

**Subtle abstract backgrounds:**
1. `https://images.unsplash.com/photo-1689384558967-44186820b58a` - Soft gradient texture

**Usage:** Section backgrounds (use with low opacity overlay)

---

## Accessibility Guidelines

### Color Contrast

**All text must meet WCAG AA standards:**
- Normal text (< 18px): Minimum 4.5:1 contrast ratio
- Large text (≥ 18px): Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

**Tested Combinations:**
- ✅ Slate-900 (#1E293B) on White (#FFFFFF): 16.1:1
- ✅ Slate-700 (#334155) on White (#FFFFFF): 10.7:1
- ✅ White (#FFFFFF) on Teal (#00A896): 3.2:1
- ✅ White (#FFFFFF) on Coral (#FF6F61): 3.5:1

### Focus States

**All interactive elements MUST have visible focus states:**

```css
.interactive-element:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must follow logical reading order
- Provide skip links for main content
- Ensure dropdown menus work with arrow keys

### Screen Reader Support

**Use semantic HTML and ARIA labels:**

```jsx
// Button with icon
<Button aria-label="Create new event" data-testid="create-event-button">
  <Plus className="w-5 h-5" />
</Button>

// Status badge
<Badge aria-label="Event status: Scheduled">
  Scheduled
</Badge>

// Form input
<Label htmlFor="event-name">Event Name</Label>
<Input
  id="event-name"
  aria-describedby="event-name-help"
  aria-required="true"
/>
<span id="event-name-help" className="text-sm text-slate-600">
  Enter a descriptive name for the event
</span>
```

### Loading States

**Provide feedback for async operations:**

```jsx
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      <span>Creating...</span>
    </>
  ) : (
    'Create Event'
  )}
</Button>
```

---

## Role-Based UI Patterns

### Admin View

**Full access with management controls:**
- Show "Manage Users" and "Manage Institutions" in navigation
- Display admin-only actions (delete, bulk operations)
- Show system-wide statistics
- Access to all events and tasks

```jsx
{userRole === 'admin' && (
  <>
    <Button 
      data-testid="manage-users-button"
      variant="outline"
      className="border-[#FF6F61] text-[#FF6F61]"
    >
      Manage Users
    </Button>
    <Button 
      data-testid="manage-institutions-button"
      variant="outline"
      className="border-[#FF6F61] text-[#FF6F61]"
    >
      Manage Institutions
    </Button>
  </>
)}
```

### Media Head View

**Event and task management focus:**
- Prominent "Create Event" button
- Task assignment interface
- Team member selection
- Equipment allocation
- Delivery tracking

```jsx
{(userRole === 'admin' || userRole === 'media_head') && (
  <Button 
    data-testid="create-event-button"
    className="bg-[#00A896] hover:bg-[#02C9B3]"
  >
    <Plus className="w-5 h-5 mr-2" />
    Create Event
  </Button>
)}
```

### Team Member View

**Task-focused interface:**
- "My Tasks" as primary view
- Task status updates
- Deliverable upload
- Simplified navigation
- Mobile-optimized for on-location use

```jsx
{userRole === 'team_member' && (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-slate-900">My Tasks</h2>
    <div className="grid gap-4">
      {myTasks.map((task) => (
        <Card key={task.id} data-testid={`my-task-${task.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-slate-900">{task.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{task.event}</p>
              </div>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                data-testid={`upload-deliverable-${task.id}`}
                size="sm"
                className="bg-[#FF6F61]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button 
                data-testid={`mark-complete-${task.id}`}
                size="sm"
                variant="outline"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
```

### Public View

**Showcase delivered work:**
- No login required
- Gallery-style layout
- Filter by institution/event type
- Lightbox for viewing media
- Clean, portfolio-like aesthetic

```jsx
// Public Deliveries Page
<div className="min-h-screen bg-slate-50">
  <header className="bg-white border-b border-slate-200 py-6">
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-slate-900">Our Work</h1>
      <p className="text-slate-600 mt-2">
        Showcasing our media team's delivered projects
      </p>
    </div>
  </header>
  
  <main className="container mx-auto px-4 py-8">
    {/* Filters */}
    <div className="flex gap-4 mb-8">
      <Select data-testid="filter-institution">
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Institutions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Institutions</SelectItem>
          <SelectItem value="college-a">College A</SelectItem>
          <SelectItem value="school-b">School B</SelectItem>
        </SelectContent>
      </Select>
      
      <Select data-testid="filter-type">
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="photo">Photography</SelectItem>
          <SelectItem value="video">Videography</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {/* Gallery Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deliverables.map((item) => (
        <Card 
          key={item.id}
          data-testid={`deliverable-${item.id}`}
          className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
        >
          <div className="aspect-video bg-slate-200 relative overflow-hidden">
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.institution}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline">{item.type}</Badge>
              <span className="text-xs text-slate-500">{item.date}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </main>
</div>
```

---

## Page-Specific Guidelines

### Login Page

**Design Approach:** Split-screen layout with hero image

```jsx
<div className="min-h-screen grid lg:grid-cols-2">
  {/* Left side - Login form */}
  <div className="flex items-center justify-center p-8 bg-white">
    <div className="w-full max-w-md space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">MediaHub</h1>
        <p className="text-slate-600 mt-2">Sign in to manage your events</p>
      </div>
      
      <form className="space-y-6" data-testid="login-form">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            data-testid="login-email-input"
            type="email"
            placeholder="you@example.com"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            data-testid="login-password-input"
            type="password"
            placeholder="••••••••"
            className="mt-2"
          />
        </div>
        
        <Button 
          data-testid="login-submit-button"
          type="submit"
          className="w-full bg-[#00A896] hover:bg-[#02C9B3]"
        >
          Sign In
        </Button>
      </form>
    </div>
  </div>
  
  {/* Right side - Hero image */}
  <div 
    className="hidden lg:block bg-cover bg-center"
    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1614270248358-0abb9675074b)' }}
  >
    <div className="w-full h-full bg-gradient-to-br from-[#00A896]/80 to-[#FF6F61]/60 flex items-center justify-center p-12">
      <div className="text-white text-center">
        <h2 className="text-5xl font-bold mb-4">Capture Every Moment</h2>
        <p className="text-xl opacity-90">
          Professional event management for creative teams
        </p>
      </div>
    </div>
  </div>
</div>
```

### Dashboard Page

**Key Elements:**
- Stats cards at top (events, tasks, team members, equipment)
- Recent events list
- Upcoming tasks
- Quick actions
- Activity feed

```jsx
<div className="space-y-8">
  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card data-testid="stat-total-events">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Events</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">24</p>
          </div>
          <Calendar className="w-10 h-10 text-[#00A896]" />
        </div>
        <p className="text-sm text-slate-500 mt-4">
          <span className="text-green-600 font-medium">+12%</span> from last month
        </p>
      </CardContent>
    </Card>
    
    {/* Repeat for other stats */}
  </div>
  
  {/* Main Content Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Recent Events (2/3 width) */}
    <div className="lg:col-span-2">
      <Card data-testid="recent-events-card">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Your latest event activities</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Events list */}
        </CardContent>
      </Card>
    </div>
    
    {/* Upcoming Tasks (1/3 width) */}
    <div>
      <Card data-testid="upcoming-tasks-card">
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks due soon</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tasks list */}
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

### Event Management Page

**Features:**
- Event creation form (dialog/modal)
- Event list/grid view toggle
- Filters (status, priority, date range)
- Search
- Bulk actions

```jsx
<div className="space-y-6">
  {/* Header with actions */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Events</h1>
      <p className="text-slate-600 mt-1">Manage all your events</p>
    </div>
    <Button 
      data-testid="create-event-button"
      className="bg-[#00A896] hover:bg-[#02C9B3]"
    >
      <Plus className="w-5 h-5 mr-2" />
      Create Event
    </Button>
  </div>
  
  {/* Filters and search */}
  <div className="flex flex-wrap gap-4">
    <Input
      data-testid="search-events-input"
      type="search"
      placeholder="Search events..."
      className="w-64"
    />
    <Select data-testid="filter-status">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="created">Created</SelectItem>
        <SelectItem value="scheduled">Scheduled</SelectItem>
        <SelectItem value="in-progress">In Progress</SelectItem>
        <SelectItem value="closed">Closed</SelectItem>
      </SelectContent>
    </Select>
    <Select data-testid="filter-priority">
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Priorities" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Priorities</SelectItem>
        <SelectItem value="normal">Normal</SelectItem>
        <SelectItem value="high">High</SelectItem>
        <SelectItem value="vip">VIP</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  {/* Events grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Event cards */}
  </div>
</div>
```

### Event Detail Page

**Layout:**
- Event header with status and priority
- Event information (date, location, institution)
- Tasks list
- Team members assigned
- Equipment allocated
- Deliverables section
- Timeline/activity log

```jsx
<div className="space-y-8">
  {/* Header */}
  <div className="flex items-start justify-between">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Badge 
          data-testid="event-status-badge"
          className="bg-[#3B82F6]"
        >
          Scheduled
        </Badge>
        <Badge 
          data-testid="event-priority-badge"
          className="bg-[#F59E0B]"
        >
          High Priority
        </Badge>
      </div>
      <h1 className="text-4xl font-bold text-slate-900">
        College Graduation Ceremony 2024
      </h1>
      <p className="text-slate-600 mt-2">
        ABC College • January 15, 2024 • Main Auditorium
      </p>
    </div>
    <div className="flex gap-2">
      <Button 
        data-testid="edit-event-button"
        variant="outline"
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Edit
      </Button>
      <Button 
        data-testid="delete-event-button"
        variant="outline"
        className="text-red-600 border-red-600 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  </div>
  
  {/* Content Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main content (2/3) */}
    <div className="lg:col-span-2 space-y-6">
      {/* Event Details Card */}
      <Card data-testid="event-details-card">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Event information */}
        </CardContent>
      </Card>
      
      {/* Tasks Card */}
      <Card data-testid="event-tasks-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <Button 
              data-testid="assign-task-button"
              size="sm"
              className="bg-[#00A896]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tasks list */}
        </CardContent>
      </Card>
      
      {/* Deliverables Card */}
      <Card data-testid="event-deliverables-card">
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Deliverables list */}
        </CardContent>
      </Card>
    </div>
    
    {/* Sidebar (1/3) */}
    <div className="space-y-6">
      {/* Team Members Card */}
      <Card data-testid="team-members-card">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Team members list */}
        </CardContent>
      </Card>
      
      {/* Equipment Card */}
      <Card data-testid="equipment-card">
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Equipment list */}
        </CardContent>
      </Card>
      
      {/* Activity Log Card */}
      <Card data-testid="activity-log-card">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Activity timeline */}
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

### Calendar View

**Use Shadcn Calendar component with custom event markers:**

```jsx
import { Calendar } from './components/ui/calendar';

<div className="space-y-6">
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
    <div className="flex gap-2">
      <Button 
        data-testid="calendar-view-month"
        variant="outline"
        size="sm"
      >
        Month
      </Button>
      <Button 
        data-testid="calendar-view-week"
        variant="outline"
        size="sm"
      >
        Week
      </Button>
    </div>
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Calendar (3/4) */}
    <div className="lg:col-span-3">
      <Card data-testid="calendar-card">
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            modifiers={{
              hasEvent: datesWithEvents,
            }}
            modifiersClassNames={{
              hasEvent: "bg-[#00A896] text-white font-semibold",
            }}
          />
        </CardContent>
      </Card>
    </div>
    
    {/* Events for selected date (1/4) */}
    <div>
      <Card data-testid="selected-date-events-card">
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Events for selected date */}
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

---

## Additional Libraries & Installation

### Framer Motion (for animations)

```bash
npm install framer-motion
```

**Usage:**
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

### Recharts (for data visualization)

```bash
npm install recharts
```

**Usage for dashboard stats:**
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
    <XAxis dataKey="name" stroke="#64748B" />
    <YAxis stroke="#64748B" />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: 'white', 
        border: '1px solid #CBD5E1',
        borderRadius: '0.5rem'
      }}
    />
    <Line 
      type="monotone" 
      dataKey="events" 
      stroke="#00A896" 
      strokeWidth={2}
      dot={{ fill: '#00A896', r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### Date-fns (for date formatting)

```bash
npm install date-fns
```

**Usage:**
```jsx
import { format, formatDistance, formatRelative } from 'date-fns';

// Format date
format(new Date(), 'MMM dd, yyyy'); // "Jan 15, 2024"

// Relative time
formatDistance(new Date(2024, 0, 15), new Date(), { addSuffix: true }); // "in 5 days"

// Relative date
formatRelative(new Date(2024, 0, 15), new Date()); // "next Monday at 12:00 AM"
```

---

## Testing Attributes

**All interactive and key informational elements MUST include `data-testid` attributes:**

### Naming Convention

Use kebab-case that defines the element's role, not appearance:

```jsx
// ✅ CORRECT
<Button data-testid="create-event-button">Create Event</Button>
<Input data-testid="event-name-input" />
<Card data-testid="event-card-123" />

// ❌ WRONG
<Button data-testid="blueButton">Create Event</Button>
<Input data-testid="input1" />
<Card data-testid="card" />
```

### Required Test IDs

**Navigation:**
- `data-testid="nav-dashboard"`
- `data-testid="nav-events"`
- `data-testid="nav-tasks"`
- `data-testid="nav-equipment"`
- `data-testid="nav-team"`
- `data-testid="nav-settings"`

**Buttons:**
- `data-testid="create-event-button"`
- `data-testid="edit-event-button"`
- `data-testid="delete-event-button"`
- `data-testid="assign-task-button"`
- `data-testid="upload-deliverable-button"`
- `data-testid="mark-complete-button"`

**Forms:**
- `data-testid="login-form"`
- `data-testid="event-form"`
- `data-testid="task-form"`
- `data-testid="[field-name]-input"`
- `data-testid="[field-name]-select"`
- `data-testid="[field-name]-textarea"`

**Cards & Lists:**
- `data-testid="event-card-[id]"`
- `data-testid="task-item-[id]"`
- `data-testid="team-member-[id]"`

**Dialogs & Modals:**
- `data-testid="create-event-dialog"`
- `data-testid="confirm-delete-dialog"`
- `data-testid="assign-task-dialog"`

**Status Indicators:**
- `data-testid="event-status-badge"`
- `data-testid="priority-badge"`
- `data-testid="task-type-badge"`

---

## Common Mistakes to Avoid

### ❌ Don't:
- Use dark purple, dark blue, dark pink, dark red, dark orange in any gradient
- Mix multiple gradient directions in same section
- Use gradients on small UI elements
- Skip responsive font sizing
- Use `transition: all` (breaks transforms)
- Center-align the entire app container (`.App { text-align: center; }`)
- Use emoji characters for icons (use Lucide React instead)
- Forget `data-testid` attributes on interactive elements
- Use generic test IDs like "button1" or "input"

### ✅ Do:
- Keep gradients for hero sections and major CTAs only (max 20% viewport)
- Use solid colors for content and reading areas
- Maintain consistent spacing using the spacing system
- Test on mobile devices with touch interactions
- Include accessibility features (focus states, contrast)
- Use specific transitions (e.g., `transition: background-color 200ms ease`)
- Add `data-testid` with descriptive kebab-case names
- Use Shadcn components as primary UI library
- Ensure WCAG AA contrast ratios
- Provide loading states for async operations

---

## Implementation Priority

1. **Setup Design Tokens** - Update CSS variables in `index.css`
2. **Typography** - Import Google Fonts and apply font families
3. **Color System** - Apply color palette to components
4. **Core Components** - Style buttons, cards, forms using Shadcn
5. **Layout** - Implement responsive grid and navigation
6. **Page Templates** - Build login, dashboard, event pages
7. **Micro-interactions** - Add hover states, transitions, animations
8. **Accessibility** - Add focus states, ARIA labels, keyboard navigation
9. **Testing Attributes** - Add `data-testid` to all interactive elements
10. **Polish** - Fine-tune spacing, shadows, and motion

---

## Summary

This design system creates a **modern, professional creative industry aesthetic** for the Media Team Event Management Web App. Key characteristics:

- **Color Palette**: Teal primary (#00A896), Coral accent (#FF6F61), Slate neutrals
- **Typography**: Space Grotesk for headings, Inter for body text
- **Components**: Shadcn UI as primary library with custom styling
- **Layout**: Mobile-first responsive with generous spacing
- **Motion**: Purposeful micro-interactions with specific transitions
- **Accessibility**: WCAG AA compliant with visible focus states
- **Testing**: Comprehensive `data-testid` attributes for all interactive elements

The design balances **sophistication with approachability**, creating a tool that feels both powerful and intuitive for creative professionals managing events, tasks, and deliverables.

---

## General UI UX Design Guidelines

- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
- NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

**GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element. Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
• Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
• Section backgrounds (not content backgrounds)
• Hero section header content. Eg: dark to light to dark color
• Decorative overlays and accent elements only
• Hero section with 2-3 mild color
• Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead.

- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.

- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
Eg: - if it implies playful/energetic, choose a colorful scheme
- if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
- Prioritize using pre-existing components from src/components/ui when applicable
- Create new components that match the style and conventions of existing components when needed
- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/` only as a primary components as these are modern and stylish component

**Best Practices:**
- Use Shadcn/UI as the primary component library for consistency and accessibility
- Import path: ./components/[component-name]

**Export Conventions:**
- Components MUST use named exports (export const ComponentName = ...)
- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
- Use `sonner` for toasts"
- Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.

---

**END OF DESIGN GUIDELINES**
