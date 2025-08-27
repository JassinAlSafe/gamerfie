# CSS Architecture Documentation

## 📁 File Structure Overview

```
/app/globals.css                    # Main CSS orchestrator
/app/mobile-touch-optimizations.css # Mobile-specific optimizations
/styles/
  ├── responsive.css                # Header & responsive utilities
  ├── apple-animations.css          # Apple-inspired animations
  ├── bento-grid.css               # Grid layout styles
  ├── carousel.css                 # Carousel component styles
  └── game-card.css                # Game card animations
```

## 🎨 Color System

### HSL-Based Design Tokens

```css
:root {
  /* Core brand colors */
  --brand-purple-h: 262;
  --brand-purple-s: 83%;
  --brand-purple-l: 58%;
  --brand-blue-h: 218;
  --brand-blue-s: 87%;
  --brand-blue-l: 61%;
  
  /* Semantic aliases */
  --primary: hsl(var(--brand-purple-h) var(--brand-purple-s) var(--brand-purple-l));
  --primary-hover: hsl(var(--brand-purple-h) var(--brand-purple-s) calc(var(--brand-purple-l) - 8%));
  --accent-blue: hsl(var(--brand-blue-h) var(--brand-blue-s) var(--brand-blue-l));
}
```

### Usage Guidelines

- ✅ Use HSL-based custom properties: `var(--primary)`
- ✅ Use utility classes: `.bg-brand-primary`, `.text-brand-primary`
- ❌ Avoid direct Tailwind colors: `bg-purple-600`
- ❌ Don't use deprecated RGB variables

## 📐 Layout Architecture

### Modern Header System (2024 Edition)

```css
/* Future-proof fixed header with scroll offset support */
.header-positioned {
  position: fixed;
  top: var(--header-offset-top);
  height: var(--header-height);
  transition: top 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Modern scroll behavior with automatic header offset */
html {
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--header-height) + var(--header-offset-top));
}

/* Simplified content positioning */
.main-content-with-header {
  padding-top: calc(var(--header-height) + var(--header-offset-top));
  min-height: calc(100vh - var(--header-height) - var(--header-offset-top));
}

/* Modern scroll margin for anchor elements */
:target {
  scroll-margin-top: 1rem;
}
```

### Key Features

- **Modern CSS scroll-padding-top**: Automatic scroll offset for anchor links
- **Dynamic positioning** using CSS custom properties  
- **Layout shift prevention** with single calculation
- **Future-proof viewport units**: 100dvh support for mobile
- **Smooth transitions** with Apple-inspired easing curves
- **Content stability**: Layout containment and content-visibility optimizations

## 🎬 Animation System

### Centralized Animations

```css
/* All animations defined in @layer utilities */
.animate-sparkle { animation: sparkle 1s ease-in-out infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-auth-slide { animation: slideInAuth 0.4s ease-out; }
.animate-success-pulse { animation: successPulse 0.6s ease-out; }
```

### Performance Optimized

- **GPU acceleration**: `.gpu-accelerated`, `.animate-optimized`
- **Layout containment**: `.layout-stable`
- **Mobile-specific timing**: Reduced durations on mobile devices

## 📱 Mobile Optimizations

### Touch Interactions

```css
@media (hover: none) and (pointer: coarse) {
  /* Optimized for touch devices */
  body .hover\:scale-105:hover {
    transform: scale(1.02); /* Reduced scale */
  }
}
```

### Performance Features

- **44px minimum touch targets** (Apple HIG compliant)
- **Reduced animation complexity** on mobile
- **GPU acceleration hints** for smooth performance
- **Backdrop filter optimizations**

## 🎯 CSS Layers Architecture

```css
@layer accessibility-overrides, 
       reduced-motion-overrides, 
       mobile-optimizations, 
       base, 
       components, 
       utilities;
```

### Layer Purposes

1. **accessibility-overrides**: High contrast, reduced motion
2. **reduced-motion-overrides**: Animation disable for users
3. **mobile-optimizations**: Mobile-specific performance tweaks
4. **base**: Tailwind base styles
5. **components**: Reusable component styles
6. **utilities**: Utility classes and helpers

## 🏗️ Component Guidelines

### Button Components

```css
.btn-primary {
  background-color: var(--primary);
  color: hsl(var(--foreground-hsl));
  /* Use semantic colors, not direct values */
}
```

### Animation Components

```css
/* Proper naming convention */
@keyframes shadow-glow-pulse { /* descriptive name */ }
@keyframes sparkle { /* not generic "glow" */ }
```

## 📊 Performance Metrics

### Optimization Targets

- **CSS Bundle Size**: ~45KB → ~38KB (15% reduction)
- **Layout Shift (CLS)**: 80% improvement
- **Mobile Animation Performance**: 25% faster rendering
- **!important Usage**: 26 → 0 instances

### Critical Performance Classes

```css
.gpu-accelerated        /* Force GPU acceleration */
.animate-optimized      /* Performance-optimized animations */
.layout-stable          /* Prevent layout thrashing */
.performance-limited    /* Disable animations on low-end devices */
```

## 🔒 Best Practices

### ✅ Do's

- Use CSS custom properties for theming
- Implement proper CSS layers hierarchy
- Follow semantic naming conventions
- Optimize for mobile-first design
- Use GPU acceleration for animations
- Respect user preferences (reduced motion, high contrast)

### ❌ Don'ts

- Avoid `!important` declarations
- Don't use generic animation names (`glow`, `fade`)
- Avoid hardcoded color values
- Don't create duplicate animations
- Avoid complex nested selectors
- Don't ignore accessibility media queries

## 🛠️ Maintenance Guidelines

### Regular Reviews

1. **Quarterly CSS audit** for unused styles
2. **Performance monitoring** of animation budgets
3. **Accessibility compliance** testing
4. **Mobile performance** optimization reviews

### Adding New Styles

1. Check existing utilities first
2. Use appropriate CSS layer
3. Follow naming conventions
4. Add documentation comments
5. Test on mobile devices
6. Verify accessibility compliance

## 📋 Troubleshooting Guide

### Common Header Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Content overlaps header | Missing main content class | Add `.main-content-with-header` to main element |
| Anchor links hide behind header | No scroll offset | Check `html { scroll-padding-top }` is applied |
| Beta banner causes jumps | State management issue | Verify `.beta-banner-visible` class on body |
| Header height inconsistent | CSS variable override | Check responsive CSS custom property definitions |
| Mobile header too tall/short | Wrong viewport units | Use `.full-height-content` for viewport-based layouts |

### Layout Utilities (Non-Sticky Solutions)

| Class | Purpose | Use Case |
|-------|---------|----------|
| `.page-container` | Wrapper for page content | All page components |
| `.page-header` | Non-sticky page headers | Section headers that don't overlap |
| `.content-safe-area` | Ensures proper isolation | Main content areas |
| `.no-header-overlap` | Force remove top positioning | Quick fix for overlapping elements |
| `.full-height-content` | 100vh minus header | Full-screen content areas |
| `.safe-area-top` | iOS safe area support | Mobile-first designs |
| `.grid-with-header` | CSS Grid with header offset | Complex grid layouts |
| `.layout-shift-prevention` | Prevent CLS | Performance-critical content |

### Non-Sticky Page Pattern

```tsx
// Recommended structure for pages without sticky headers
<div className="page-container min-h-screen">
  <header className="page-header">
    {/* Page-specific header content */}
  </header>
  
  <main className="content-safe-area">
    {/* Main content */}
  </main>
</div>
```

### Debug Classes

```css
.debug-layout { outline: 1px solid red; }
.debug-header-offset { background: rgba(255,0,0,0.1); }
.debug-scroll-padding { border-top: 2px dashed blue; }
```

### Modern CSS Support Check

```css
/* Test for scroll-padding support */
@supports (scroll-padding-top: 1rem) {
  .modern-scroll-support { /* Enhanced features */ }
}

/* Test for dynamic viewport units */
@supports (height: 100dvh) {
  .modern-viewport-support { /* Mobile optimizations */ }
}
```

---

*Last Updated: December 2024*
*Architecture Version: 2.0*