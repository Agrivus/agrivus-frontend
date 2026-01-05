# Agrivus Phase 5: Implementation Documentation

**Project**: Agrivus - Digital Agricultural Marketplace Platform
**Phase**: 5 - Implementation Documentation & Technical Specification
**Date**: January 2024
**Document Status**: Final - Ready for Development Handoff
**Target Audience**: Engineering teams, Product managers, QA leads, Stakeholders

---

## TABLE OF CONTENTS

1. Executive Summary
2. Detailed Design Specifications
3. Wireframe Documentation
4. Technical Implementation Guide
5. Phased Rollout Strategy

---

# 1. EXECUTIVE SUMMARY

## 1.1 Project Overview

**Scope**: Complete UI/UX redesign of Agrivus agricultural marketplace platform
**Duration**: 6-8 weeks (Phase 4) + 8-10 weeks (Phase 5) = 14-18 weeks total
**Budget Range**: $180,000 - $250,000 (estimated)
**Team Size**: 3-4 engineers + 1 QA + 0.5 designer (ongoing refinement)
**Key Platforms**: Web (React/Vite), Mobile-responsive, future mobile apps

---

## 1.2 Three Most Critical Design Changes & Expected Impact

### **CHANGE #1: Trust-Centric Information Architecture** ⭐ HIGHEST IMPACT
**What's Changing**:
- Seller verification badges and ratings moved to prominent positions (top of listings, above price)
- Quality certification system overhaul (visual grade badges A+/A/B/C with color coding)
- Transaction history/proof of successful sales displayed prominently ("145 successful transactions")
- Blockchain product authenticity integration (Phase 2 feature, now surfaced in UI)

**Expected Impact**:
- Conversion rate: +8-12% (agricultural buyers prioritize trust signals)
- Average order value: +5-7% (buyers more confident in premium products)
- Seller performance scores: More visible = higher platform engagement
- Chargeback rate: -3-5% (quality transparency reduces disputes)

**Business Rationale**: Phase 3 research showed agricultural buyers rank trust (60%) and quality assurance (45%) as top decision factors before pricing.

**Timeline**: Weeks 1-4 of Phase 5
**Risk**: May require backend schema changes for seller scores/certifications

---

### **CHANGE #2: Mobile-First Touch Optimization (48px+ All Touch Targets)** ⭐ HIGHEST IMPACT
**What's Changing**:
- All buttons increased from 40px to 48px minimum height
- Bottom navigation bar (fixed) replaces top hamburger menu for mobile
- Form inputs padded to 48px height (12px vertical padding)
- Icon buttons padded to 48px × 48px squares
- Card spacing increased from 16px to 24px gaps
- Tap target minimum: 48×48px (WCAG 2.5 enhancement standard)

**Expected Impact**:
- Mobile conversion rate: +10-15% (easier to tap, fewer misclicks)
- Mobile bounce rate: -8-12% (better usability = longer sessions)
- Customer support tickets: -15-20% (fewer accidental actions)
- Mobile session duration: +20-30% (users stay longer with better UX)

**Business Rationale**: 70%+ of Agrivus users access via mobile; current touch targets too small for outdoor/agricultural use with gloves.

**Timeline**: Weeks 2-6 of Phase 5
**Risk**: Larger buttons may reduce content density; requires careful layout adjustments

---

### **CHANGE #3: Transparent Pricing & Market Comparison** ⭐ HIGH IMPACT
**What's Changing**:
- 6-month price history charts on product pages (line graph showing trends)
- Competitor price comparison widget ("Other sellers: $1,100-$1,300 per ton")
- Volume discount tier display (clear "10+ tons: $1,150, 50+ tons: $1,100")
- Price alert system (notify users of favorable prices)
- Cost breakdown for auction items (base price + platform fee + shipping)

**Expected Impact**:
- Average deal size: +7-10% (buyers see value in bulk purchases)
- Buyer confidence: +25% (price transparency = informed decisions)
- Auction participation: +12-18% (visibility into market trends)
- Platform credibility: +15-20% (market data builds trust)

**Business Rationale**: Phase 3 research showed "price clarity" mentioned by 72% of users as top pain point. Current interface obscures true cost of transactions.

**Timeline**: Weeks 4-7 of Phase 5
**Risk**: Requires historical price data integration; may expose pricing inefficiencies

---

## 1.3 Key Success Metrics & KPIs

### **Primary Metrics** (Directly Measure Design Impact)

| Metric | Current Baseline | Target (Post-Phase 5) | Measurement Method |
|---|---|---|---|
| **Mobile Conversion Rate** | 2.1% | 3.2-3.8% | Google Analytics |
| **Desktop Conversion Rate** | 3.5% | 4.0-4.5% | Google Analytics |
| **Mobile Session Duration** | 2:15 min | 3:00-3:30 min | Google Analytics |
| **Mobile Bounce Rate** | 48% | 38-42% | Google Analytics |
| **Touch Error Rate** | 8-12% | < 2% | Event tracking |
| **Accessibility Score (WCAG)** | ~85% | 99-100% | Automated audit + manual |
| **Lighthouse Performance** | 72 | 85+ | PageSpeed Insights |
| **Page Load Time (P75)** | 3.2s | < 2.5s | Core Web Vitals |

### **Secondary Metrics** (Business Impact)

| Metric | Current Baseline | Target (Post-Phase 5) | Impact |
|---|---|---|---|
| **Average Order Value** | $850 | $910-$950 | +$60-100 per order |
| **Seller Boost Adoption** | 8% | 15-18% | +$40-60K monthly revenue |
| **Customer Support Tickets** | 180/month | 140-150/month | -20-25% |
| **Seller Verification Rate** | 42% | 68-75% | More trusted transactions |
| **Repeat Purchase Rate** | 22% | 28-32% | Increased loyalty |

### **Tertiary Metrics** (User Satisfaction)

| Metric | Target | Measurement |
|---|---|---|
| **NPS Score** | 45-55 | Quarterly survey |
| **CSAT (Checkout)** | 85% | Post-transaction survey |
| **Task Completion Rate** | 94% | Usability testing |
| **Feature Discoverability** | 78% | User testing + analytics |

---

## 1.4 Timeline & Budget Overview

### **High-Level Timeline**

```
Phase 5 Duration: 8-10 weeks
├─ Weeks 1-2: Setup, migration planning, color/typography system in code
├─ Weeks 2-5: Core component implementation (buttons, forms, cards)
├─ Weeks 5-7: Page integration (marketplace, auctions, checkout)
├─ Weeks 7-9: Mobile optimization + testing
└─ Weeks 9-10: Refinement, performance optimization, launch prep

Go-Live: Phased rollout over 2-4 weeks
- Week 10: 10% user traffic (beta testers)
- Week 11: 25% user traffic (staged rollout)
- Week 12: 50% user traffic (half platform)
- Week 13: 100% traffic (full launch)
```

### **Budget Breakdown** ($180K - $250K Total)

| Category | Allocation | Details |
|---|---|---|
| **Engineering** | $120K - $160K | Component development, page integration, testing |
| **Design Refinement** | $15K - $20K | Ongoing design feedback, pixel perfection, animation polish |
| **QA & Testing** | $20K - $30K | Manual testing, accessibility audit, performance testing, UAT |
| **Infrastructure** | $10K - $15K | Database optimization, CDN upgrades, performance monitoring |
| **Contingency** | $15K - $25K | Scope overflow, risk mitigation, post-launch fixes |

**Cost per developer-hour**: $125-150 (fully loaded)
**Recommended team size**: 3.5 FTE for 8 weeks = ~1,400 hours = $175K-210K engineering alone

---

## 1.5 Risks, Dependencies & Mitigation

### **Critical Dependencies**

| Dependency | Status | Impact | Mitigation |
|---|---|---|---|
| **Supabase Database Upgrade** | Pending | Required for historical price data, seller scores | Fast-track schema migration in Week 1 |
| **Image CDN Configuration** | Pending | Critical for product image optimization | Pre-configure Cloudflare in Week 0 |
| **Mobile App Launch Timeline** | TBD | Affects mobile-first prioritization | Use responsive web as foundation for apps |
| **Third-party Integrations** | TBD | Payment, shipping, market data APIs | Identify + schedule integration week 2 |
| **Design System Handoff** | In progress | Figma → Code tokens | Automation tools (Style Dictionary) |

### **Technical Risks** & Mitigation

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Breaking existing functionality** | HIGH | MEDIUM | Comprehensive feature testing + regression suite |
| **Performance degradation** | MEDIUM | LOW | Bundle analysis + performance budgets |
| **Database migration issues** | HIGH | LOW | Backup strategy, dry-run migrations |
| **Cross-browser compatibility** | MEDIUM | LOW | Automated testing (Browserstack) |
| **Accessibility compliance gaps** | HIGH | MEDIUM | Monthly accessibility audits, expert review |
| **Team skill gaps in design systems** | MEDIUM | MEDIUM | Training, documentation, pair programming |

### **Business Risks** & Mitigation

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Scope creep** | HIGH | HIGH | Lock requirements in writing, change control process |
| **User resistance to change** | MEDIUM | MEDIUM | Phased rollout, user communication, rollback plan |
| **Competitive response** | MEDIUM | LOW | Speed to market, continuous iteration |
| **Platform stability during migration** | HIGH | LOW | Staged rollout (10% → 25% → 50% → 100%) |
| **Budget overrun** | MEDIUM | MEDIUM | Weekly budget tracking, contingency fund |

---

## 1.6 Stakeholder Sign-Off & Approval

**Document Approval**:
- [ ] Engineering Lead (Signature/Date)
- [ ] Product Manager (Signature/Date)
- [ ] Design Lead (Signature/Date)
- [ ] Executive Sponsor (Signature/Date)

**Approval Notes**:
```
This document serves as the official technical specification for Phase 5 implementation.
All deviations from this spec require formal change request and stakeholder approval.
```

---

# 2. DETAILED DESIGN SPECIFICATIONS

## 2.1 Product Listing Card

### **Visual Specifications**

**Dimensions** (Desktop):
- Width: Flexible (grid-based: 280px - 320px in 4-column layout)
- Height: Auto-expanding (~480px typical for product card)
- Aspect ratio: Image 1:1 (square)
- Border-radius: 12px (matching design system)
- Box-shadow: 0 1px 3px rgba(0,0,0,0.05) default; 0 10px 15px rgba(0,0,0,0.1) hover

**Dimensions** (Mobile):
- Width: 100% - 32px padding (full width minus gutters)
- Height: Auto
- Image aspect ratio: 1:1 (square)
- Same border-radius and shadow as desktop

**Layout Stack** (Top to Bottom):
```
┌─────────────────────────────────────┐
│ Image Area (1:1 aspect ratio)       │ 100% width
├─────────────────────────────────────┤
│ [GRADE A+] Badge (top-right overlay)│ Positioned absolute, top-right
│ Product Title: H4 (20px)            │ 24px padding, dark charcoal
│ "Green Beans - Grade A"             │
├─────────────────────────────────────┤
│ Seller Info Line:                   │ 16px padding
│ John Farmer [Verified ✓]            │ Bold name + green badge
│ ⭐⭐⭐⭐⭐ (4.9/5)              │ Inline rating
│ 145 Successful Transactions         │ Gray text, 12px
├─────────────────────────────────────┤
│ Price Section:                      │ 16px padding, background: pale green
│ $1,200 per ton (H3: 24px bold green)│ Primary Green color (#1a5c2a)
│ Min order: 10 tons | Stock: 500t    │ Small text (12px gray)
├─────────────────────────────────────┤
│ Action Buttons:                     │ 24px gap between buttons
│ [Contact Seller] [Quick Bid]        │ 48px height (mobile-optimized)
│ (Side by side on desktop, stacked   │
│  on mobile)                         │
└─────────────────────────────────────┘
```

### **Color Specifications**

| Element | Color | Hex Code | Usage |
|---|---|---|---|
| **Background** | White | #ffffff | Card background |
| **Image Border** | Light Gray | #e5e7eb | Subtle frame around image |
| **Title Text** | Dark Charcoal | #1f2937 | Product name heading |
| **Seller Name** | Dark Charcoal (bold) | #1f2937 | Weight: 600 |
| **Seller Verification Badge** | Light Gold background | #fef3c7 | Border: #d4af37, checkmark icon green |
| **Rating Text** | Medium Gray | #6b7280 | Secondary information |
| **Price** | Primary Green | #1a5c2a | Bold, H3 size (24px) |
| **Price Background** | Pale Green | #c8e6c9 | 12px padding around price |
| **Secondary Text** | Medium Gray | #6b7280 | Min order, stock info |
| **Button (Primary)** | Primary Green | #1a5c2a | 48px height, white text |
| **Button (Secondary)** | Very Light Gray | #f3f4f6 | Dark text, bordered |

### **Typography Specifications**

| Element | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| **Product Title** | Inter | 20px | 600 | 1.4em |
| **Seller Name** | Inter | 16px | 600 | 1.5em |
| **Verification Badge** | Space Grotesk | 12px | 600 | 1.0em |
| **Rating** | Inter | 14px | 400 | 1.5em |
| **Transaction Count** | Inter | 12px | 400 | 1.5em |
| **Price** | Inter | 24px | 700 | 1.4em |
| **Secondary Text** | Inter | 12px | 400 | 1.5em |
| **Button Text** | Inter | 16px | 600 | 1.4em |

### **Interactive States & Micro-Animations**

**Default State**:
- Opacity: 100%
- Transform: none
- Shadow: 0 1px 3px rgba(0,0,0,0.05)

**Hover State** (Desktop only):
- Transform: translateY(-4px) (subtle lift effect)
- Shadow: 0 10px 15px rgba(0,0,0,0.1) (elevated shadow)
- Border-color: Secondary Green (#2d7d3d)
- Image brightness: +5% (slight brightening)
- Transition duration: 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)

**Focus State** (Keyboard navigation):
- Outline: 2px solid Primary Green (#1a5c2a)
- Outline-offset: 4px
- Box-shadow: existing shadow + 0 0 0 4px rgba(26,92,42,0.1)

**Active State** (On click):
- Transform: none
- Shadow: 0 4px 6px rgba(0,0,0,0.08) (pressed effect)
- Duration: Instant

### **Responsive Breakpoints**

**Mobile (< 640px)**:
- Width: 100% - 16px (full width minus small gutters)
- Grid: 1 column (full-width cards)
- Image: 1:1 aspect ratio maintained
- Title: 18px (H5)
- Price: 22px (slightly smaller than desktop)
- Padding: 16px (reduced from 24px)
- No hover effects (touch interface)

**Tablet (640px - 1024px)**:
- Width: 48% (2 columns in grid)
- Grid: 2 columns with 16px gap
- Image: 1:1
- Title: 20px (H4)
- Price: 24px (H3)
- Padding: 20px

**Desktop (1024px+)**:
- Width: auto (4-column grid, 280-320px each)
- Grid: 4 columns with 24px gap
- All sizing as specified above

**Large Desktop (1536px+)**:
- Width: auto (4 columns, possible 5 with sidebar)
- Grid: 4 columns with 32px gap

### **Accessibility Requirements**

**Semantics**:
- Card wrapped in `<article>` tag (semantic HTML)
- Image has descriptive alt text: "Green beans grade A from John Farmer"
- Title: `<h2>` heading (proper hierarchy)
- Links/buttons: Proper `<a>` and `<button>` tags

**ARIA Attributes**:
- Seller verification badge: `aria-label="Verified Seller"`
- Price section: `aria-label="Price information: $1200 per ton"`
- Rating: `aria-label="Rating: 4.9 out of 5 stars"`

**Color Contrast**:
- Price (#1a5c2a on #c8e6c9): 8.2:1 ✅ (exceeds WCAG AA)
- Title (#1f2937 on #fff): 17.8:1 ✅ (exceeds WCAG AAA)
- Button text (white on #1a5c2a): 13.2:1 ✅ (exceeds WCAG AAA)

**Focus Management**:
- Tab order: Title → Image → Seller info → Price → Contact button → Bid button
- Focus visible on all interactive elements
- Focus trap avoided (can tab away from card)

**Screen Reader Support**:
- Card announced as article region
- Image alternative text provides context
- Button purposes clear without visual design
- No icon-only elements

---

## 2.2 Auction Countdown Timer

### **Visual Specifications**

**Normal State** (More than 1 hour remaining):
- Display: Hidden (reduce visual clutter)
- Or compact display: "5h 23m remaining" in sidebar

**Active State** (< 1 hour remaining):
- Size: 24px font (H3 level)
- Background: Error Red (#ef4444)
- Text Color: White
- Padding: 12px 16px
- Border-radius: 8px
- Width: Auto (inline display)
- Position: Prominent (top of auction section)
- Font-family: Inter
- Font-weight: 700 (bold)

**Animation** (Final 60 minutes):
```css
@keyframes urgency-pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.countdown-timer {
  animation: urgency-pulse 2s infinite;
  animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
}
```
- Pulse rate: 2-second cycle
- Subtlety: Not obnoxious, but noticeable
- Intensity: Decreases as urgency approaches (final 5 min: faster)

**Format Specification**:
- Display format: "3h 45m 22s"
- Granularity: Hours (if > 24h) → Minutes (if > 1h) → Seconds (final 60s)
- Numeric font: Tabular numbers (monospaced for alignment)
- Icon: Optional hourglass or alarm clock (12px)

**End State** (Auction Ended):
- Background: Very Light Gray (#f3f4f6)
- Text Color: Medium Gray (#6b7280)
- Text: "Auction Ended"
- No animation
- Clickable → links to results/winner page

### **Responsive Specifications**

**Mobile (< 640px)**:
- Size: 20px font (H4 level)
- Padding: 10px 14px (more compact)
- Width: 100% (full-width container)
- Position: Below title, above bid display
- Text: Larger, easier to read on small screens

**Desktop (1024px+)**:
- Size: 24px (H3)
- Position: Top-right of auction section or in sidebar
- Display: Inline with other auction info

---

## 2.3 Mobile Bottom Navigation

### **Visual Specifications**

**Container Dimensions**:
- Height: 64px (minimum safe height for landscape mode)
- Width: 100vw (full viewport width)
- Position: Fixed (fixed bottom: 0)
- Z-index: 50 (above main content, below modals)
- Background: White (#ffffff)
- Border-top: 1px solid Light Gray (#d1d5db)
- Box-shadow: 0 -2px 8px rgba(0,0,0,0.08) (subtle shadow above)

**Safe Area Consideration** (iPhone notch/bottom safe area):
- Padding-bottom: env(safe-area-inset-bottom) in CSS
- Fallback: 16px on non-notch devices
- Total height: 64px + safe-area-inset

**Tab Structure** (5 main tabs):
```
┌──────┬──────┬──────┬──────┬──────┐
│ Home │Search│ Chat │Orders│ Me   │
│ 🏠  │ 🔍  │ 💬  │ 📋  │ 🧑  │
└──────┴──────┴──────┴──────┴──────┘
```

**Tab Item Dimensions**:
- Width: 20% (5 tabs = 100% / 5)
- Height: 64px (full height)
- Flex: 1 (equal distribution)
- Display: flex, flex-direction: column
- Align-items: center
- Justify-content: center
- Gap between icon & label: 4px

**Icon Specifications**:
- Size: 24px × 24px
- Color (Inactive): Medium Gray (#6b7280)
- Color (Active): Primary Green (#1a5c2a)
- Font weight: Regular (400) for icons
- Source: Material Design Icons (MDI) or custom SVG

**Label Specifications**:
- Font: Inter
- Size: 12px
- Weight: 400 (regular), 600 (active)
- Color (Inactive): Medium Gray (#6b7280)
- Color (Active): Primary Green (#1a5c2a)
- Line-height: 1.2 (tight, single line)
- Overflow: No truncation (labels fit within 20% width)

### **Active/Inactive States**

**Inactive Tab** (Default):
```
Icon: Medium Gray (#6b7280)
Label: Medium Gray, weight 400
Background: Transparent
Cursor: pointer (on hover)
Opacity: 100%
```

**Hover State** (Desktop only, N/A for touch):
```
Background: Very Light Gray (#f3f4f6), subtle
Icon color: Secondary Green (#2d7d3d)
Transition: 150ms ease
```

**Active Tab** (Current page):
```
Icon: Primary Green (#1a5c2a)
Label: Primary Green, weight 600
Background: Very subtle gradient (optional):
  linear-gradient(to bottom, rgba(26,92,42,0.02), transparent)
Border-top: 2px solid Primary Green (#1a5c2a)
```

### **Notification Badge Specifications**

**Position & Size**:
- Position: Absolute, top-right of icon
- Size: 16px × 16px (diameter)
- Border-radius: 50% (circle)
- Offset: -4px right, -4px top (slight overlap)
- Z-index: 10 (above tab items)

**Styling**:
- Background: Error Red (#ef4444)
- Text color: White
- Font-size: 10px
- Font-weight: 700 (bold)
- Content: "1", "2", "9+", "99" (show count, max "99+")
- Text-align: center
- Line-height: 1 (no extra spacing)

**Applied To**:
- Chat tab: Shows unread message count
- Orders tab: Shows pending order count
- Removed for: Home, Search, Me (not transactional)

**Animation**:
- Appear: Fade in + scale (0.8 → 1.0) over 300ms
- Disappear: Fade out + scale (1.0 → 0.8) over 300ms
- Number update: Quick pulse animation (scale 1.0 → 1.15 → 1.0) over 200ms

### **Keyboard & Touch Interaction**

**Touch Targets**:
- Full tab area (20% width × 64px height) is clickable
- Minimum 48×48px safe touch target ✅

**Focus States**:
- Focus outline: 2px solid Primary Green
- Outline-offset: -2px (inside the tab)
- Visible on keyboard navigation (Tab key)

**Screen Reader**:
- Each tab: `<button aria-label="Home" aria-current="page">`
- Active tab includes `aria-current="page"`
- Badge: `<span aria-label="3 unread messages">`

### **Responsive Behavior**

**Mobile (360px - 768px)**: As specified above (always visible)

**Tablet (768px - 1024px)**:
- Bottom nav still visible (mobile-optimized for tablet UX)
- Transition point: Some apps hide nav on tablet + show top nav

**Desktop (1024px+)**:
- This component hidden
- Replaced with traditional top navigation bar

---

## 2.4 Form Validation & Error States

### **Input Field Specifications**

**Default State**:
- Background: White (#ffffff)
- Border: 1px solid Light Gray (#d1d5db)
- Border-radius: 8px
- Padding: 12px 16px (vertical × horizontal)
- Height: 44px (including padding)
- Font: Inter, 16px, weight 400
- Color: Dark Charcoal (#1f2937)
- Placeholder-color: Medium Gray (#6b7280)
- Cursor: text

**Focus State**:
- Border-color: Primary Green (#1a5c2a)
- Outline: 2px solid Primary Green
- Outline-offset: 2px
- Box-shadow: 0 0 0 3px rgba(26,92,42,0.1) (light green halo)
- Transition: 150ms ease

**Hover State**:
- Border-color: Secondary Green (#2d7d3d)
- Cursor: text
- No outline (focus-only)

**Filled State** (User typed content):
- Border-color: Primary Green (#1a5c2a)
- Background: Unchanged (white)
- Left-border: 2px solid Primary Green (visual indicator)
- Text-color: Dark Charcoal

**Error State**:
- Border-color: Error Red (#ef4444)
- Border-left: 4px solid Error Red (#ef4444) (thick left border)
- Background: #fff5f5 (very light red tint)
- Outline: 2px solid Error Red on focus
- Box-shadow: 0 0 0 3px rgba(239,68,68,0.1) (light red halo)

**Disabled State**:
- Background: Very Light Gray (#f3f4f6)
- Border-color: Light Gray (#d1d5db)
- Text-color: Medium Gray (#6b7280)
- Cursor: not-allowed
- Opacity: 70%

### **Label & Helper Text Specifications**

**Label**:
- Font: Inter, 14px, weight 500
- Color: Dark Charcoal (#1f2937)
- Display: block
- Margin-bottom: 8px
- Required indicator: Red asterisk (*) after text
- `<label for="email-input">Email Address *</label>`

**Helper Text** (Below input):
- Font: Inter, 12px, weight 400
- Color: Medium Gray (#6b7280)
- Margin-top: 4px
- Display: block
- Example: "We'll use this for order notifications"

**Error Message** (Below input, replaces helper):
- Font: Inter, 14px, weight 400
- Color: Error Red (#ef4444)
- Icon: Exclamation mark (12px) + space + text
- Margin-top: 4px
- Aria-live: polite (announced to screen readers immediately)
- Examples:
  - "Invalid email format. Please use email@example.com"
  - "Password must be at least 8 characters"
  - "Username already taken"

**Success Message** (Below input, green checkmark):
- Font: Inter, 12px, weight 400
- Color: Success Green (#16a34a)
- Icon: Checkmark (12px)
- Example: "✓ Email verified"
- Displayed after validation passes

### **Form Field States in Context**

**Email Input - Normal**:
```
Email Address *
[━━━━━━━━━━━━━━━━━━━━━━━] 1px border
Help text: We'll use this for order notifications (gray)
```

**Email Input - Focused**:
```
Email Address *
[━━━━━━━━━━━━━━━━━━━━━━━] 2px green outline + 2px offset
Help text: We'll use this for order notifications
```

**Email Input - Filled + Valid**:
```
Email Address *
┃━━━━━━━━━━━━━━━━━━━━━━━ user@example.com
┃ 4px thick left border (green)
✓ Email verified (green text, 12px)
```

**Email Input - Error**:
```
Email Address *
┃━━━━━━━━━━━━━━━━━━━━━━━ user@invalid
┃ 4px thick left border (red)
⚠ Invalid format. Use email@example.com (red text, 14px)
```

### **Validation Specifications**

**Real-time Validation**:
- Triggers: On blur (lose focus) or after 1 second typing pause
- Not: On every keystroke (annoying)
- Debounce: 500ms (prevent excessive API calls)
- Feedback: Error/success icon + text message

**Field Types & Rules**:

| Field | Validation Rule | Error Message | Real-time? |
|---|---|---|---|
| **Email** | RFC 5322 format | Invalid email format | On blur |
| **Password** | Min 8 chars, 1 number, 1 uppercase | Password requirements not met | After 500ms |
| **Username** | 3-20 chars, alphanumeric + underscore | Must be 3-20 characters | On blur (check availability) |
| **Phone** | E.164 format (country code required) | Invalid phone number | On blur |
| **Product Quantity** | Min 1, required field | Must be at least 1 | On change |
| **Price** | Positive number, max 2 decimals | Invalid price | On change |

**Form Submission Validation**:
- Client-side: Prevent submission if errors exist
- Button disabled state if form invalid
- Server-side: Always validate (never trust client)
- Error summary: List all errors at top of form (in alert region)

### **Accessibility**

**ARIA Attributes**:
- `aria-required="true"` on required fields
- `aria-invalid="true"` on error state
- `aria-describedby="email-error-text"` linking input to error message
- `aria-label` for icon-only buttons
- `role="alert"` on error summary for announcements

**Form Structure**:
```html
<form>
  <fieldset>
    <legend>Checkout Information</legend>

    <div class="form-field">
      <label for="email">Email Address *</label>
      <input
        id="email"
        type="email"
        aria-required="true"
        aria-describedby="email-help email-error"
      />
      <div id="email-help" class="helper-text">
        We'll use this for order notifications
      </div>
      <div id="email-error" role="alert" class="error-text">
        <!-- Error shown here -->
      </div>
    </div>
  </fieldset>
</form>
```

---

## 2.5 Auction Page Header Section

### **Layout & Responsive Specifications**

**Desktop Layout** (1024px+):
```
┌────────────────────────────────────┬──────────────────┐
│ Left Column (70%)                  │ Right Sidebar    │
│                                    │ (30%)            │
│ Auction Title                      │ Recent Bids      │
│ [GRADE A+] Premium Certified      │ • $1,250 - 2h   │
│                                    │ • $1,200 - 3h   │
│ Seller Information                 │ • $1,150 - 4h   │
│ Current Bid & Price Display        │                  │
│ Time Remaining (Red if < 1h)      │ [Place Bid]      │
│ Product Details                    │ [Contact]        │
│ Quantity Available                 │ [Share]          │
│ Certifications                     │                  │
│                                    │                  │
└────────────────────────────────────┴──────────────────┘
```

**Tablet Layout** (640px - 1024px):
- Single column, full-width
- Recent bids: Collapsed to small section or carousel
- All elements stack vertically
- Width: 100% - 24px padding

**Mobile Layout** (< 640px):
- Single column, full-width
- Width: 100% - 16px padding
- Recent bids: Expandable section (accordion)
- All buttons full-width
- Sticky countdown timer (top of page)

### **Component Specifications**

**Title Section**:
- Text: H1 (32px, dark charcoal, weight 700)
- Badge: [GRADE A+] positioned top-left
- Subtitle: "Green Beans - Grade A" (H2, 24px)
- Spacing: 24px gap between title and next section

**Seller Information Block**:
- Layout: Vertical stack
- Seller name: 16px, weight 600
- Verification badge: [✓ Verified] inline
- Rating: "⭐⭐⭐⭐⭐ (4.9/5)" inline, 14px
- Transaction count: "145 Successful Transactions" (12px gray)
- CTA: "→ View Seller Profile" (link, green)
- Background: Optional very light gray (#f3f4f6) with 16px padding
- Border-radius: 8px

**Current Bid Display Card**:
- Background: Pale Green (#c8e6c9)
- Padding: 24px
- Border-radius: 12px
- Border: 1px solid Secondary Green (#2d7d3d)
- Content:
  - Label: "Current Bid" (14px gray)
  - Price: "₹1,250 per ton" (H2, 28px, Primary Green, bold)
  - Bid count: "4 bids placed" (12px gray)
- Margin: 24px from previous section

**Countdown Timer**:
- Display: Hidden if > 1 hour
- If < 1 hour: H3 (24px), Error Red background, white text
- Padding: 12px 16px
- Pulse animation: 2s cycle
- Border-radius: 8px
- Positioned: Top-right (desktop) or below title (mobile)

**Price Details Section**:
- Layout: 2-column grid (desktop), 1-column (mobile)
- Items:
  - "Starting Bid: ₹500/ton"
  - "Minimum Order: 10 tons"
  - "Quantity Available: 500 tons"
  - "Increment: ₹50"
- Font: 14px, dark charcoal
- Values: Bold, 16px
- Spacing: 12px between items
- Background: Very light gray (#f3f4f6)
- Padding: 16px
- Border-radius: 8px

**Certifications Section**:
- Header: "Certifications" (H4, 16px)
- Display: Horizontal row of badge buttons
- Badges: [Organic] [Fair Trade] [GAP Certified]
- Style: Background light gold, dark charcoal text
- Size: 14px text, 8px padding, 6px border-radius
- Spacing: 8px gap between badges

### **Recent Bids Sidebar (Desktop)**

**Container**:
- Width: 100% of right sidebar
- Background: White
- Border: 1px light gray
- Border-radius: 12px
- Padding: 16px

**Header**:
- "Recent Bids" (H4, 16px)
- Margin-bottom: 12px

**Bid Items** (Scrollable list):
- Height: Max 300px, overflow-y auto
- Each item: 12px padding, 8px bottom border
- Format: "$1,250 - 2h ago"
- Layout: Two columns (price | time) or single line
- Price: Bold, 14px, dark charcoal
- Time: 12px gray, right-aligned
- Hover: Very light gray background

**Empty State**:
- "No bids yet. Be the first!" (14px gray, italic)
- CTA: [Place Bid] button

---

# 3. WIREFRAME DOCUMENTATION

## 3.1 Product Listing Page Wireframes

### **BEFORE: Current Design Issues**

```
┌─────────────────────────────────────────────────┐
│ Header: Agrivus | Search (small) | Menu         │ ← Small elements
├─────────────────────────────────────────────────┤
│ Filters: Category | Price | Location | Rating   │
├─────────────────────────────────────────────────┤
│ ┌──────┬──────┬──────┬──────┐                   │
│ │ Item │ Item │ Item │ Item │ ← Small cards    │
│ │(200) │(200) │(200) │(200) │ (240px total)   │
│ │      │      │      │      │ Touch target:   │
│ │Price │Price │Price │Price │ 30px - Too      │
│ │      │      │      │      │ small for mobile│
│ └──────┴──────┴──────┴──────┘                   │
│ ┌──────┬──────┬──────┬──────┐                   │
│ │ Item │ Item │ Item │ Item │                   │
│ └──────┴──────┴──────┴──────┘                   │
│                                                 │
│ [Load More]                                     │
└─────────────────────────────────────────────────┘

Issues:
1. No quality grade visible at card level
2. Seller verification hard to spot
3. Cards too small for mobile
4. Trust signals not prominent
5. No access to recent bids/demand signals
```

### **AFTER: Phase 5 Redesigned Layout**

```
┌───────────────────────────────────────────────────────┐
│ Header: Agrivus | Search (expanded) | Notifications   │ ← Larger touch
├───────────────────────────────────────────────────────┤
│ Filters: [Category ▼] [Price ▼] [Location ▼]         │ ← Tappable buttons
│          [Quality ▼] [Verification ▼]                 │
│ Active filters: [Organic ✕] [Grade A+ ✕]              │
├───────────────────────────────────────────────────────┤
│
│ ┌─────────────────┬─────────────────┐               │ Desktop (2 cols)
│ │ ┌─────────────┐ │ ┌─────────────┐ │ On tablet:   │
│ │ │  [Grade A+] │ │ │  [Grade A+] │ │ 2 columns    │
│ │ │   Image     │ │ │   Image     │ │ On mobile:   │
│ │ │   1:1 ratio │ │ │   1:1 ratio │ │ 1 column     │
│ │ ├─────────────┤ │ ├─────────────┤ │
│ │ │Green Beans  │ │ │Rice Paddy   │ │
│ │ │Grade A      │ │ │Premium      │ │
│ │ ├─────────────┤ │ ├─────────────┤ │ Card height:
│ │ │John Farmer  │ │ │FarmCo Inc   │ │ ~520px (up from
│ │ │✓ Verified   │ │ │✓ Verified   │ │ 400px)
│ │ │⭐⭐⭐⭐  │ │ │⭐⭐⭐⭐  │ │
│ │ │145 Trans    │ │ │89 Trans     │ │ Touch targets:
│ │ ├─────────────┤ │ ├─────────────┤ │ 48px+ buttons
│ │ │$1,200/ton   │ │ │$850/ton     │ │
│ │ │(Pale Green) │ │ │(Pale Green) │ │ Price now
│ │ │Min: 10t     │ │ │Min: 25t     │ │ visually
│ │ │Stock: 500t  │ │ │Stock: 200t  │ │ prominent
│ │ ├─────────────┤ │ ├─────────────┤ │
│ │ │[Contact]    │ │ │[Contact]    │ │ Better spacing:
│ │ │[Quick Bid]  │ │ │[Quick Bid]  │ │ 24px between
│ │ │(48px each)  │ │ │(48px each)  │ │ elements
│ │ └─────────────┘ │ └─────────────┘ │
│ └─────────────────┴─────────────────┘
│
│ ┌─────────────────┬─────────────────┐
│ │ ┌─────────────┐ │ ┌─────────────┐ │
│ │ │  [Grade B]  │ │ │  [Grade A]  │ │
│ │ │   Image     │ │ │   Image     │ │
│ │ ├─────────────┤ │ ├─────────────┤ │
│ │ │Cassava      │ │ │Sweet Corn   │ │
│ │ │Grade B      │ │ │Grade A      │ │
│ │ │Farmer Jane  │ │ │AgriTrade    │ │
│ │ │⭐⭐⭐⭐⭐│ │ │⭐⭐⭐⭐⭐│ │
│ │ │$450/ton     │ │ │$1,100/ton   │ │
│ │ │[Contact]    │ │ │[Contact]    │ │
│ │ │[Quick Bid]  │ │ │[Quick Bid]  │ │
│ │ └─────────────┘ │ └─────────────┘ │
│ └─────────────────┴─────────────────┘
│
│ Pagination: [< 1 2 3 4 5 >] (48px buttons)
└───────────────────────────────────────────────────────┘

(Mobile: Single column, full width cards)

Improvements:
✓ Grade badges visible at card level
✓ Seller verification prominent (top + badge)
✓ Larger cards for better touchability
✓ Price section with pale green background (stands out)
✓ Proper spacing (24px between elements)
✓ 48px touch targets (buttons, links)
✓ Better visual hierarchy
```

### **Information Architecture & User Flow**

**User Flow: Finding & Bidding on Product**
```
Start: Landing Page
  ↓
1. Search / Browse (Marketplace page)
   - View category filters
   - View price filters
   - See quality grade filters
   - See seller verification filter
   ↓
2. Select Product (Click card)
   - Route to /product/:productId
   - Load product details
   ↓
3. Review Product (Product Detail page)
   - Scroll through images
   - Read seller info
   - Check certifications
   - Review price history
   - Check 6-month trends
   - Compare with competitors
   ↓
4. Place Bid / Contact Seller
   - Option A: [Quick Bid] → Auction flow
   - Option B: [Contact Seller] → Chat flow
   ↓
5. Checkout
   - If auction: Wait for result
   - If direct: Add to cart → Payment
   ↓
End: Order Confirmation / Auction Winner
```

**Navigation Hierarchy**:
```
Home
├── Marketplace
│   ├── Category: Grains
│   │   ├── Product (Corn) → Detail → Bid/Chat → Checkout
│   │   ├── Product (Rice) → Detail → Bid/Chat → Checkout
│   │   └── Product (Wheat) → Detail → Bid/Chat → Checkout
│   ├── Category: Vegetables
│   ├── Category: Fruits
│   └── Auctions (subset of marketplace)
├── My Orders
│   ├── Active Orders
│   ├── Completed Orders
│   └── Disputed Orders
├── Chat (Messages with sellers)
├── Wallet (Payment history)
└── Profile
    ├── Account Settings
    ├── Payment Methods
    ├── My Listings (if seller)
    └── Seller Dashboard (if seller)
```

---

## 3.2 Auction Detail Page Wireframe

### **BEFORE: Current Design**

```
┌──────────────────────────────────────┐
│ Header: Agrivus | Search | Menu      │
├──────────────────────────────────────┤
│ Auction: Green Beans                 │ ← Title small (18px)
│ Price: $1,200/ton                    │ ← Not emphasized
│ Seller: FarmCo Inc                   │
│ Status: Active                       │
│                                      │
│ Time: 5h 23m 14s                     │ ← Regular text, not urgent
│ Bids: 4                              │
│ Starting Price: $500/ton             │
│                                      │
│ [Place Bid] [Contact] [Share]        │ ← Small buttons (40px)
│                                      │
│ Description paragraph...             │
│ (Limited information below fold)     │
└──────────────────────────────────────┘

Issues:
1. Current price not visually prominent
2. Countdown not urgent (no red, no animation)
3. Auction info scattered, no summary card
4. No bid history visible
5. Buttons too small
6. Trust info (seller rating) hidden
```

### **AFTER: Phase 5 Redesigned**

```
Desktop View (1024px+):
┌────────────────────────────────────────────┬──────────────────┐
│ Left Content (70%)                         │ Right Sidebar    │
├────────────────────────────────────────────┼──────────────────┤
│ [GRADE A+] Premium Certified               │ Recent Bids      │
│ Green Beans - Grade A (H1: 32px)          │ ┌──────────────┐│
│                                            │ │$1,250 - 2h  ││
│ Seller Information:                        │ │$1,200 - 3h  ││
│ John Farmer [✓ Verified]                   │ │$1,150 - 4h  ││
│ ⭐⭐⭐⭐⭐ (4.9/5)                      │ │$1,100 - 5h  ││
│ 145 Successful Transactions                │ └──────────────┘│
│ → View Seller Profile                      │                  │
│                                            │ ┌──────────────┐│
│ ┌────────────────────────────────────┐    │ │[Place Bid]   ││
│ │ Current Bid: $1,250 per ton        │    │ │(48px height) ││
│ │ 4 bids placed                      │    │ │              ││
│ │ (Pale Green background, 24px pad)  │    │ │[Contact]     ││
│ └────────────────────────────────────┘    │ │[Share]       ││
│                                            │ └──────────────┘│
│ ┌────────────────────────────────────┐    │                  │
│ │ 🔴 TIME REMAINING: 3h 45m 22s      │    │ Market Info:     │
│ │ (Error Red, pulsing animation)     │    │ Other sellers:   │
│ │ (Hidden if > 1 hour)               │    │ $1,100-$1,300/t  │
│ └────────────────────────────────────┘    │ Avg price: $1,180│
│                                            │                  │
│ Starting: $500/ton                        │                  │
│ Quantity: 500 tons available              │                  │
│ Minimum: 10 tons per purchase             │                  │
│ Increment: ₹50                            │                  │
│ Pickup: Available                         │                  │
│ Delivery: Kenya (500km away)              │                  │
│                                            │                  │
│ Certifications:                           │                  │
│ [Organic] [Fair Trade] [GAP Certified]    │                  │
│                                            │                  │
│ Price History (6 months):                 │                  │
│ [Line graph showing price trend]          │                  │
│ Apr: $950 | May: $1,050 | Jun: $1,200    │                  │
│                                            │                  │
│ Product Images (carousel):                │                  │
│ [Image 1] [Image 2] [Image 3]             │                  │
│ ◄ ► (navigation arrows, 48px touch)       │                  │
│                                            │                  │
│ Product Description:                      │                  │
│ "Green beans from John's farm in Kenya... │                  │
│  Hand-picked, Grade A quality, certified  │                  │
│  organic. Delivered within 48 hours."     │                  │
│                                            │                  │
│ Seller's Other Products:                  │                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐      │                  │
│ │Product 1│ │Product 2│ │Product 3│      │                  │
│ │ (cards) │ │ (cards) │ │ (cards) │      │                  │
│ └─────────┘ └─────────┘ └─────────┘      │                  │
│                                            │                  │
└────────────────────────────────────────────┴──────────────────┘

Mobile View (< 640px):
┌──────────────────────────────────┐
│ [GRADE A+]                        │
│ Green Beans - Grade A             │
│                                  │
│ John Farmer ⭐⭐⭐⭐⭐        │
│ [✓ Verified] • 145 Transactions  │
│ → View Profile (link)            │
│                                  │
│ ┌──────────────────────────────┐ │
│ │Current Bid: $1,250 per ton   │ │
│ │4 bids placed                 │ │ Pale green bg
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │🔴 3h 45m 22s (pulsing)       │ │ Red bg, urgent
│ └──────────────────────────────┘ │
│                                  │
│ Recent Bids:                     │
│ ▼ Show/Hide                      │
│ • $1,250 - 2h ago               │
│ • $1,200 - 3h ago               │
│ • $1,150 - 4h ago               │
│                                  │
│ [Place Bid]                      │ Full width
│ [Contact Seller]                 │ 48px height
│ [Share]                          │
│                                  │
│ Starting: $500/ton               │
│ Min Order: 10 tons               │
│ Available: 500 tons              │
│ Location: Kenya                  │
│                                  │
│ Certifications:                  │
│ [Organic] [Fair Trade]           │
│                                  │
│ Price Trend (6 months):          │
│ [Compressed line graph]          │
│                                  │
│ Product Images (carousel):       │
│ [Image - swipe to next]          │
│ 1/3 (shows current position)     │
│                                  │
│ Description: "Green beans from..." │
│                                  │
│ Seller's Other Products:         │
│ [Product cards - vertical scroll]│
│                                  │
└──────────────────────────────────┘

Improvements:
✓ Price much larger (H2: 28px)
✓ Countdown timer prominent + urgent (red, pulsing)
✓ Seller info with verification badge visible
✓ Recent bids social proof visible
✓ Clear call-to-action buttons (48px)
✓ Price history chart (market transparency)
✓ Competitor pricing shown
✓ Better visual hierarchy
✓ Mobile-optimized layout
```

---

## 3.3 Mobile Bottom Navigation Integration

### **Wireframe: Mobile App Structure**

```
All Pages Include Bottom Navigation:

┌─────────────────────────────────────┐
│         Page Content                │
│     (Home, Search, Chat, etc.)      │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🏠     🔍     💬     📋     🧑    │ Fixed bottom
│ Home  Search  Chat  Orders  Me      │ (64px height)
└─────────────────────────────────────┘
  ↑      ↑      ↑      ↑      ↑
  │      │      │      │      └─ Profile (active)
  │      │      │      └────────── Orders (badge: 3)
  │      │      └─────────────────── Chat (badge: 5)
  │      └────────────────────────── Search
  └────────────────────────────────── Home

Navigation Map:
┌─ HOME ────────────────────────────┐
│ • Featured Products                │
│ • Recent Activity                  │
│ • Seller Promotions                │
│ • Quick Links to Auctions          │
└────────────────────────────────────┘

┌─ SEARCH ───────────────────────────┐
│ • Search Bar (prominent)            │
│ • Filters (Category, Price, etc.)   │
│ • Recent Searches                   │
│ • Browse by Category                │
│ • Results List                      │
└────────────────────────────────────┘

┌─ CHAT ─────────────────────────────┐
│ • Conversation List                 │
│ • Unread count badge                │
│ • Search conversations              │
│ • Individual Chat Windows           │
│ • Notification badge on icon        │
└────────────────────────────────────┘

┌─ ORDERS ───────────────────────────┐
│ • Active Orders (with status)       │
│ • Order History                     │
│ • Order Details / Tracking          │
│ • Pending Shipments                 │
│ • Notification badge if action req'd│
└────────────────────────────────────┘

┌─ PROFILE/ME ───────────────────────┐
│ • User Avatar + Name                │
│ • Account Settings                  │
│ • Payment Methods                   │
│ • Addresses                         │
│ • Preferences                       │
│ • My Listings (if seller)           │
│ • Logout                            │
└────────────────────────────────────┘
```

### **Tab Content Details**

**Home Tab - Content Hierarchy**:
```
┌─────────────────────────────────────┐
│ 👤 Welcome, John Farmer             │
│ (Personalized greeting)             │
├─────────────────────────────────────┤
│ [Search Bar] (tappable, 48px)       │
├─────────────────────────────────────┤
│ Your Activity:                      │
│ • Active Bids: 2                    │
│ • In Transit: 1 order               │
│ • Balance: ₹5,000                   │
│ (Quick stats, tappable)             │
├─────────────────────────────────────┤
│ Featured This Week:                 │
│ [Product Card Carousel]             │
│ [← Green Beans →] (swipeable)       │
│ [← Rice Paddy →]                    │
│ [← Cassava →]                       │
├─────────────────────────────────────┤
│ Recent Auctions:                    │
│ [Auction card] [Auction card]       │
│ [2 cards in row, vertical scroll]   │
├─────────────────────────────────────┤
│ Your Interests:                     │
│ [View All] (link)                   │
│ #Organic #GradeA #FairTrade         │
│ (Hashtag-like tags, tappable)       │
├─────────────────────────────────────┤
│ Suggested Sellers:                  │
│ [Seller card] [Seller card]         │
│ [Follow button on each]             │
└─────────────────────────────────────┘
```

---

## 3.4 Forms & User Input Wireframes

### **Checkout Form Wireframe**

```
Desktop View (1024px+):
┌────────────────────────────────────────────────┐
│ CHECKOUT                                       │
├────────────────────────────────────────────────┤
│ Step 1 of 3: Shipping Address                 │
│ [Complete] [In Progress] [Pending] (progress)  │
├────────────────────────────────────────────────┤
│ Full Name *                                    │
│ [Email input, 16px, 44px height]              │
│ Help: Used for shipping label                 │
│                                                │
│ Email Address *                               │
│ [Email input with green border]               │
│ ✓ Email verified                              │
│                                                │
│ Phone Number *                                │
│ [Phone input]                                 │
│ [Country code selector ▼]                     │
│                                                │
│ Address *                                     │
│ [Text input]                                  │
│                                                │
│ City *        │ State/Province *              │
│ [Input]       │ [Dropdown]                    │
│                                                │
│ Postal Code * │ Country *                     │
│ [Input]       │ [Dropdown - pre-filled]       │
│                                                │
│ ☐ Billing address same as shipping           │
│                                                │
│ [Cancel]                [Continue to Payment]│
│ (48px buttons, clear CTAs)                    │
└────────────────────────────────────────────────┘

Mobile View (< 640px):
┌──────────────────────────────┐
│ ← CHECKOUT                   │ (Back button)
├──────────────────────────────┤
│ Step 1 of 3: Shipping        │
│ [████░░░] Progress bar       │
├──────────────────────────────┤
│ Full Name *                  │
│ [Full-width input, 44px]     │
│                              │
│ Email Address *              │
│ [Full-width input]           │
│ ✓ Email verified (green)     │
│                              │
│ Phone Number *               │
│ [Input] [Country ▼]          │
│ (Country selector in field)  │
│                              │
│ Address *                    │
│ [Full-width input]           │
│                              │
│ City *                       │
│ [Full-width input]           │
│                              │
│ State/Province *             │
│ [Dropdown, 48px]             │
│                              │
│ Postal Code *                │
│ [Input]                      │
│                              │
│ Country *                    │
│ [Dropdown]                   │
│                              │
│ ☐ Billing same as shipping  │
│                              │
│ [Continue to Payment]        │ Full width
│ (48px height)                │
│                              │
│ [Cancel]                     │ Link
└──────────────────────────────┘

Validation Behavior:
• Email: Real-time check on blur
• Phone: Format validation as you type
• Address: Google Maps autocomplete
• Postal code: Validate against country
• All errors shown in-field (red border + message)
• Submit button disabled until all fields valid
```

---

# 4. TECHNICAL IMPLEMENTATION GUIDE

## 4.1 Required Technology Stack & Platform Changes

### **Frontend Architecture**

**Current Stack** (Phase 5 Base):
- React 19.2 with TypeScript
- Vite (build tool)
- Tailwind CSS 3.4 (styling)
- Socket.io-client 4.8 (real-time chat)
- React Router DOM 7.9 (routing)
- Axios 1.13 (HTTP client)

**Phase 5 Additions/Changes**:

| Layer | Current | Change | Reason |
|---|---|---|---|
| **Component Library** | None | Implement Headless UI / Radix UI | Unstyled, accessible components |
| **State Management** | Context API | Keep Context, add React Query | Better data fetching + caching |
| **Styling Approach** | Tailwind utility classes | Tailwind + CSS-in-JS for animations | Complex animations need JS |
| **Animation Library** | None | Framer Motion | Advanced micro-animations |
| **Form Library** | HTML forms | React Hook Form | Better form state management |
| **Image Optimization** | Direct img tags | Next-gen Image component | WebP, lazy loading, optimization |
| **Testing** | None | Vitest + React Testing Library | Unit + integration testing |
| **Accessibility** | Manual | axe-core + automated testing | Catch violations before release |

**Recommended Stack Changes**:
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.6",
    "axios": "^1.13.2",
    "socket.io-client": "^4.8.1",
    "react-query": "^3.39.3",
    "react-hook-form": "^7.48.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.5",
    "axe-core": "^4.8.0",
    "@axe-core/react": "^1.2.3"
  }
}
```

### **Backend / Database Changes**

**Supabase Schema Migrations Required**:

1. **Seller Scores & Verification Table** (New)
```sql
CREATE TABLE seller_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  verification_status VARCHAR(50), -- 'verified', 'pending', 'rejected'
  successful_transactions INT DEFAULT 0,
  cancellation_rate DECIMAL(3,2) DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  quality_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

2. **Product Grade Classification** (Schema Change)
```sql
-- Add to existing products table:
ALTER TABLE products ADD COLUMN IF NOT EXISTS grade VARCHAR(2);
-- Values: 'A+', 'A', 'B', 'C'

ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_verified BOOLEAN DEFAULT FALSE;
```

3. **Historical Price Data** (New)
```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products NOT NULL,
  price_per_unit DECIMAL(12,2),
  quantity_available INT,
  recorded_date TIMESTAMP DEFAULT now(),
  market_segment VARCHAR(50) -- 'wholesale', 'retail', 'export'
);

CREATE INDEX idx_product_date ON price_history(product_id, recorded_date);
```

4. **Auction Bid History** (Update existing)
```sql
-- Ensure bids table exists and tracks:
-- - bid_id, auction_id, user_id, bid_amount, bid_time
-- - Create view for "recent bids on auction"

CREATE VIEW recent_auction_bids AS
SELECT id, auction_id, bid_amount, created_at
FROM bids
WHERE auction_id = ? -- parameterized
ORDER BY created_at DESC
LIMIT 10;
```

5. **Enable RLS for New Tables**:
```sql
ALTER TABLE seller_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view seller scores
CREATE POLICY "Public seller scores"
  ON seller_scores FOR SELECT
  USING (true);

-- RLS Policy: Price history is public
CREATE POLICY "Public price history"
  ON price_history FOR SELECT
  USING (true);
```

### **Image & Asset Optimization**

**CDN Configuration** (Cloudflare recommended):
- Enable WebP conversion
- Enable lazy loading for images
- Enable Cloudflare Mirage (JPEG quality optimization)
- Cache TTL: 30 days for product images
- Image resize rules:
  - Thumbnail: max-width 300px
  - Card: max-width 400px
  - Detail: max-width 800px

**Product Image Handling**:
```jsx
// Component example
<picture>
  <source
    srcSet="image.webp"
    type="image/webp"
  />
  <source
    srcSet="image.jpg"
    type="image/jpeg"
  />
  <img
    src="image-fallback.jpg"
    alt="Green Beans Grade A"
    loading="lazy"
    width={400}
    height={400}
  />
</picture>
```

---

## 4.2 Third-Party Integrations

### **Market Data APIs** (For Price Comparison & Trends)

**Integration #1: Agricultural Commodity Pricing API**
- **Service**: USDA NASS or Agri-tech provider (e.g., CommodityAI)
- **Endpoint**: `/api/commodity-prices?product=green-beans&period=6m`
- **Data**: Historical prices, market trends, volume
- **Update Frequency**: Daily
- **Authentication**: API key in `.env` (never expose client-side)
- **Response Format**:
```json
{
  "product": "green-beans",
  "priceHistory": [
    {
      "date": "2024-01-01",
      "price": 950,
      "currency": "USD",
      "unit": "per-ton"
    },
    // ... 180 more days of data
  ],
  "currentMarketPrice": 1200,
  "competitors": [
    { "seller": "FarmCo", "price": 1150 },
    { "seller": "Farmer John", "price": 1250 }
  ]
}
```

**Implementation**: Fetch on product page load; cache for 24 hours

### **Payment Gateway Integration** (Already likely in place, confirm)

**Service**: Stripe / Razorpay (India-focused)
- Ensure Supabase connected to payment API
- Webhook configuration for payment status updates
- PCI compliance maintained
- Capture payment → Update order status → Trigger fulfillment

### **SMS/Email Notifications** (For Auction Alerts)

**Service**: Twilio / SendGrid
- Send bid notifications: "You've been outbid! New price: $1,250"
- Send countdown alerts: "Auction ends in 1 hour!"
- Send auction results: "Auction won! Next steps: Payment → Delivery"
- Required fields in DB: user phone numbers, email preferences

---

## 4.3 Performance Optimization Recommendations

### **Web Vitals Targets**

| Metric | Current | Target | Technique |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | 3.5s | < 2.5s | Image optimization, code splitting |
| **FID** (First Input Delay) | 150ms | < 100ms | Defer non-critical JS |
| **CLS** (Cumulative Layout Shift) | 0.12 | < 0.1 | Fixed dimensions, font-display: swap |

### **Bundle Size Optimization**

```javascript
// Current estimated: 668KB (gzip: 161KB)
// Target: < 400KB (gzip: < 120KB)

// Strategy 1: Code Splitting
// Before:
import { AuctionPage, ProductPage, CheckoutPage } from './pages';

// After:
const AuctionPage = lazy(() => import('./pages/AuctionPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// Strategy 2: Tree Shaking
// Ensure package.json has "sideEffects": false
// Remove unused dependencies (e.g., unused icon libraries)

// Strategy 3: Dynamic Imports
// Load price charts only when needed
const PriceChart = lazy(() => import('./components/PriceChart'));
```

### **Database Query Optimization**

**Problem**: N+1 queries (loading products + seller info separately)

**Solution**: Use Supabase joins + select specific columns
```javascript
// BAD: N+1 queries
const products = await supabase.from('products').select();
for (const product of products) {
  const seller = await supabase
    .from('users')
    .select()
    .eq('id', product.seller_id);
}

// GOOD: Single query with join
const { data } = await supabase
  .from('products')
  .select(`
    id, title, price,
    users(id, name, rating),
    seller_scores(verification_status, successful_transactions)
  `)
  .limit(20);
```

### **Caching Strategy**

**React Query Configuration**:
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Product listings: staleTime 10min (products change slowly)
// User profile: staleTime 30min (user data rarely changes)
// Chat messages: staleTime 0 (real-time via Socket.io)
// Price history: staleTime 24h (updated once daily)
```

---

## 4.4 SEO Considerations

### **Meta Tags & Schema Markup**

**Product Page Meta Tags**:
```html
<meta name="description" content="Grade A Green Beans from John Farmer - $1,200/ton, organic certified, 500 tons in stock" />
<meta property="og:title" content="Green Beans Grade A - Agrivus Marketplace" />
<meta property="og:image" content="https://cdn.agrivus.com/products/green-beans-grade-a.webp" />
<meta property="og:price" content="1200" />
<meta property="og:price:currency" content="USD" />
```

**Structured Data (JSON-LD)**:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Green Beans Grade A",
  "description": "Organic certified green beans from Kenya",
  "image": "https://cdn.agrivus.com/products/green-beans.webp",
  "brand": { "@type": "Organization", "name": "Agrivus" },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "price": "1200",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "John Farmer"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "ratingCount": "145"
  }
}
```

### **URL Structure**

**Current** (if applicable): `/products?id=123`
**Better SEO**: `/marketplace/products/green-beans-grade-a-123`

**URL Slug Pattern**:
- Format: `/category/product-name-product-id`
- Slug: URL-friendly, lowercase, hyphens
- ID: Appended for uniqueness
- Example: `/marketplace/vegetables/green-beans-grade-a-12ab34cd`

### **Mobile SEO**

- Responsive design ✅ (Phase 5 focus)
- Mobile viewport meta tag ✅
- Legible font sizes (16px+) ✅
- 48px+ touch targets ✅
- Fast loading (Core Web Vitals) ✅

---

# 5. PHASED ROLLOUT STRATEGY

## 5.1 Phase 5A: Foundation & Setup (Weeks 1-2)

### **Deliverables**

**Week 1:**
- [ ] Design system tokens in code (Tailwind config)
  - Color palette (16 colors)
  - Typography scale (6 sizes)
  - Spacing system (8px base)
  - All CSS variables defined
- [ ] Database migrations applied (seller scores, grades, price history)
- [ ] Component library structure created
  - Button component (all variants)
  - Input component (all states)
  - Card component
  - Badge component
- [ ] Build pipeline optimized
  - Tree-shaking configured
  - Code splitting setup
  - Performance budgets defined

**Week 2:**
- [ ] React Hook Form integration
  - Form wrapper component
  - Validation rules
  - Error handling
- [ ] React Query setup
  - Query client configuration
  - Custom hooks for data fetching
  - Caching strategy
- [ ] API layer for new endpoints
  - Seller scores API
  - Price history API
  - Market comparison API
- [ ] Testing infrastructure
  - Vitest configured
  - Testing utilities
  - Component test examples

### **Team Responsibilities**

**Engineering** (2 developers):
- Setup React Query, React Hook Form
- Database migrations
- Build optimization

**QA** (0.5 developer):
- Build verification
- Test environment setup
- Migration validation

**Design** (0.25 developer):
- Token refinement
- Component approval
- Documentation

### **Acceptance Criteria**

- [ ] Build size < 600KB gzipped (down from 668KB)
- [ ] All database migrations applied successfully
- [ ] Component library has 5 core components
- [ ] Performance budget established
- [ ] No breaking changes in existing features
- [ ] Documentation updated

---

## 5.2 Phase 5B: Component Implementation (Weeks 2-5)

### **Week 2-3: Interactive Components**

**Priority 1: Buttons & Inputs**
- [ ] Button component with 4 variants (primary, secondary, danger, icon)
  - All states: default, hover, focus, active, disabled
  - Sizes: small (32px), medium (44px), large (52px)
  - Micro-animations: 200ms transitions
- [ ] Text input with validation states
  - Focus ring (2px green, 2px offset)
  - Error state (red left border, 4px)
  - Success state (green left border, 4px)
  - Helper text + error messages
- [ ] Form label with required indicator
- [ ] Checkbox & radio buttons (20px default size)

**Tests Required**:
```javascript
describe('Button Component', () => {
  test('renders primary button with correct color', () => {
    const { getByText } = render(
      <Button variant="primary">Click me</Button>
    );
    const btn = getByText('Click me');
    expect(btn).toHaveStyle('background-color: #1a5c2a');
  });

  test('has focus ring on focus', () => {
    const { getByRole } = render(
      <Button>Click me</Button>
    );
    const btn = getByRole('button');
    fireEvent.focus(btn);
    expect(btn).toHaveFocus();
    expect(btn).toHaveStyle('outline: 2px solid #1a5c2a');
  });

  test('is disabled with correct styles', () => {
    const { getByRole } = render(
      <Button disabled>Disabled</Button>
    );
    const btn = getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveStyle('opacity: 0.6');
  });
});
```

**Priority 2: Cards & Layout**
- [ ] Card component (white background, 1px border, 12px radius)
  - Hover state: lift + shadow
  - Image support: aspect ratio 1:1
  - Content slots: header, body, footer
- [ ] Product card (specialized: image + title + price + buttons)
- [ ] Badge component (seller, quality, status)

### **Week 4-5: Form & Navigation Components**

**Priority 3: Select & Complex Inputs**
- [ ] Select dropdown (with arrow icon)
- [ ] Date picker (if needed for auctions)
- [ ] Multi-select (for filters)
- [ ] Search input with suggestions

**Priority 4: Navigation**
- [ ] Header component
  - Logo + navigation links
  - Search bar
  - Notification bell
  - User menu
- [ ] Bottom tab navigation (mobile)
  - 5 tabs: Home, Search, Chat, Orders, Me
  - Notification badges
  - Active state styling
- [ ] Breadcrumb navigation

**Tests**: Same pattern as Button - test states, accessibility, focus management

### **Team Responsibilities**

**Engineering** (2 developers, split work):
- Developer 1: Buttons, inputs, cards
- Developer 2: Navigation, complex components
- Both: Testing, accessibility audits

**QA** (1 developer):
- Component testing
- Accessibility testing (axe-core)
- Visual regression testing

### **Acceptance Criteria**

- [ ] 10+ components implemented
- [ ] 100% WCAG AA compliant (automated + manual audit)
- [ ] 90%+ test coverage
- [ ] All components in Storybook (optional but recommended)
- [ ] No visual regressions
- [ ] All micro-animations smooth (60fps)

---

## 5.3 Phase 5C: Page Integration (Weeks 4-7)

### **Week 4-5: Marketplace Pages**

**Product Listing Page**:
- [ ] Migrate from old card layout to new design
  - Larger cards (280-320px)
  - Quality grade badges visible
  - Seller verification prominent
  - Trust signals (transaction count, rating)
  - 24px spacing between elements
- [ ] Add filters (category, price, quality, verification)
- [ ] Update grid (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Implement card hover animations

**Testing**:
- [ ] Product cards load correctly
- [ ] All trust signals visible
- [ ] Filters work and persist
- [ ] Touch targets 48px+ (mobile)
- [ ] Responsive layout works across breakpoints

**Product Detail Page**:
- [ ] Add price history chart (6 months)
- [ ] Add seller verification badge prominently
- [ ] Display certifications with icons
- [ ] Show competitor pricing
- [ ] Add quality grade at top
- [ ] Implement image carousel (swipe on mobile)

### **Week 5-6: Auction Pages**

**Auction List**:
- [ ] Show auction-specific cards
  - Countdown timer (visible if < 1 hour)
  - Current bid prominently
  - Bid count
  - Grade badge

**Auction Detail Page**:
- [ ] Countdown timer with red background + pulse animation
- [ ] Current bid display (pale green card)
- [ ] Recent bids sidebar (desktop) / collapsible section (mobile)
- [ ] Price history chart
- [ ] Competitor pricing widget
- [ ] Seller information card
- [ ] CTA buttons: [Place Bid], [Contact], [Share]

**Testing**:
- [ ] Countdown timer updates correctly
- [ ] Bids display in real-time (via Socket.io)
- [ ] Timer turns red at < 1 hour
- [ ] Price charts load correctly
- [ ] Responsive layout (desktop sidebar → mobile full-width)

### **Week 6-7: Checkout & Forms**

**Checkout Flow**:
- [ ] Step 1: Shipping Address
  - Form with validation
  - Address autocomplete
  - Error states visible
- [ ] Step 2: Payment Information
  - Card input (Stripe integration)
  - Billing address option
- [ ] Step 3: Review & Confirm
  - Summary of order
  - Final price with breakdown
  - [Place Order] button

**Testing**:
- [ ] Form validation works
- [ ] Error messages clear
- [ ] Disabled states correct
- [ ] Focus management proper
- [ ] Payment integration secure

### **Team Responsibilities**

**Engineering** (2-3 developers):
- Developer 1: Product pages
- Developer 2: Auction pages
- Developer 3: Checkout & forms
- All: Testing & accessibility

**Designer** (0.25 FTE):
- Visual review during implementation
- Pixel perfection verification
- Animation feedback

**QA** (1 developer):
- Feature testing
- Regression testing
- Accessibility audits
- Performance testing

### **Acceptance Criteria**

- [ ] All 5+ major pages migrated to new design
- [ ] No breaking changes to functionality
- [ ] All animations smooth (60fps)
- [ ] Lighthouse score 85+ on all pages
- [ ] Core Web Vitals passing
- [ ] 98%+ WCAG AA compliance
- [ ] User feedback positive (if beta testing)

---

## 5.4 Phase 5D: Mobile Optimization & Polish (Weeks 7-9)

### **Week 7-8: Mobile-Specific Implementation**

**Bottom Navigation Integration**:
- [ ] Implement fixed bottom nav on all mobile pages
- [ ] Route transitions work smoothly
- [ ] Active tab state clear
- [ ] Notification badges appear correctly
- [ ] No content hidden behind nav (padding added)

**Mobile Touch Optimization**:
- [ ] Audit all touch targets (48px+ minimum)
- [ ] Increase button sizes if needed
- [ ] Adjust spacing for mobile (16px gutters)
- [ ] Test with actual touch (not just mouse)
- [ ] Verify no accidental taps trigger actions

**Mobile Form Optimization**:
- [ ] Input focus triggers keyboard
- [ ] Labels visible above inputs
- [ ] Full-width inputs
- [ ] Large buttons (48px)
- [ ] Error messages clear
- [ ] Submit button doesn't disappear under keyboard

**Mobile Image Optimization**:
- [ ] WebP conversion enabled in CDN
- [ ] Lazy loading working
- [ ] Aspect ratios maintained
- [ ] No layout shift on load

### **Week 8-9: Performance & Testing**

**Performance Optimization**:
- [ ] Code splitting: Route-based chunks
- [ ] Image optimization: Next-gen formats
- [ ] Bundle analysis: No surprises
- [ ] Cache headers: Long TTL for static assets
- [ ] Minification: Production builds only
- [ ] Network: Monitored during testing

**Performance Targets**:
```
Before Phase 5:
- LCP: 3.5s → Target: 2.5s
- FID: 150ms → Target: 100ms
- CLS: 0.12 → Target: 0.1

Budget:
- JS bundle: < 400KB gzipped
- CSS bundle: < 50KB gzipped
- HTML: < 50KB
- Images: < 3MB per page (before lazy load)
```

**Testing & QA**:
- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests: All major flows
- [ ] E2E tests: Critical paths (if available)
- [ ] Accessibility audit: axe-core + manual
- [ ] Visual regression: Compare old vs. new
- [ ] Performance profiling: DevTools
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Real device testing: iPhone, Android, tablet

### **Week 9: Final Polish & Launch Prep**

**Design Polish**:
- [ ] Animations reviewed & smoothed
- [ ] Shadows consistent
- [ ] Spacing precise (8px multiples)
- [ ] Colors accurate (hex match)
- [ ] Typography sizing verified
- [ ] Focus rings visible & appropriately colored

**Documentation**:
- [ ] Component library documented
- [ ] Usage guidelines written
- [ ] Design system maintained
- [ ] Known issues logged
- [ ] Accessibility report finalized
- [ ] Performance report generated

**Rollback Plan**:
- [ ] Feature flags configured
  - Can disable new UI if needed
  - Gradual rollout enabled
- [ ] Database backups verified
- [ ] Previous build archived
- [ ] Rollback procedure documented

### **Team Responsibilities**

**Engineering** (2-3 developers):
- Mobile optimization
- Performance tuning
- Testing & bug fixes

**QA** (1 developer):
- Comprehensive testing
- Device testing
- Final sign-off

**Product** (0.25 FTE):
- Stakeholder communication
- Launch coordination

### **Acceptance Criteria**

- [ ] All pages optimized for mobile
- [ ] 48px+ touch targets everywhere
- [ ] Lighthouse 85+ on all pages
- [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] WCAG 2.1 AA 98%+ compliance
- [ ] Zero critical bugs
- [ ] Team sign-off received

---

## 5.5 Phase 5E: Phased Launch (Weeks 10-13)

### **Week 10: Beta Launch (10% Traffic)**

**Rollout**:
- Feature flag: `enableNewDesign = 10%`
- Metrics collected: Errors, performance, user behavior
- Duration: 5-7 days
- Monitoring: 24/7

**Monitoring**:
- Error rate: Must stay < 0.1%
- Page load time: Monitor LCP, FID, CLS
- User engagement: Session duration, bounce rate
- Conversion: Add-to-cart, bid placement, checkout

**Decision Gate**:
- All metrics green? → Proceed to 25%
- Issues found? → Fix → Re-test at 10% → Proceed
- Critical issues? → Rollback → Debug → Re-launch

### **Week 11: Staged Rollout (25% → 50%)**

**Day 1: 25% Traffic**
- Expand beta to 25%
- Monitor for 24 hours
- Collect feedback from more users

**Day 3-4: 50% Traffic**
- If no issues, expand to 50%
- More performance data collection
- Real-world device usage patterns

**Rollback Criteria**:
- Error rate > 0.5%
- Conversion drop > 5%
- Critical feature broken
- Performance degradation > 20%

### **Week 12-13: Full Launch (100%)**

**Day 1: Announce to Users**
- In-app notification: "New design rolling out!"
- Email: "Check out our refreshed marketplace"
- Social media post

**Day 1-7: 100% Traffic**
- All users on new design
- Monitor closely for issues
- Respond to user feedback
- Document learnings

**Post-Launch (Ongoing)**
- Monitor Lighthouse scores daily
- Track KPIs: Conversion, engagement, support tickets
- Iterate based on user feedback
- Plan Phase 6 (if needed)

### **Rollback Procedure** (If Issues Found)

**Automatic Rollback** (Feature flag):
```javascript
// In app initialization
if (errorRate > 0.5% || performanceDegradation > 20%) {
  enableNewDesign = false; // Revert to old design
  alertEngineeringTeam();
}
```

**Manual Rollback**:
1. Toggle feature flag: `enableNewDesign = false`
2. Update all affected components
3. Clear browser cache (CDN purge)
4. Verify all pages work
5. Notify users of temporary revert
6. Begin investigation (post-mortem)

**Investigation Process**:
- [ ] Gather error logs
- [ ] Analyze performance profiles
- [ ] Identify root cause
- [ ] Fix issue
- [ ] Test thoroughly
- [ ] Re-plan launch with timeline
- [ ] Communicate with stakeholders

---

## 5.6 Post-Launch Monitoring & Iteration

### **Key Metrics to Track** (Daily)

| Metric | Target | Alert Threshold |
|---|---|---|
| **Error Rate** | < 0.1% | > 0.5% |
| **LCP** | < 2.5s | > 3.5s |
| **FID** | < 100ms | > 200ms |
| **CLS** | < 0.1 | > 0.15 |
| **Mobile Conversion** | 3.2-3.8% | < 2.8% or > 4.5% |
| **Session Duration** | 3:00-3:30 min | < 2:30 min |
| **Support Tickets** | < 150/month | > 200/month |

### **Weekly Review** (Every Monday)

**Metrics Review**:
- [ ] Core Web Vitals trending up?
- [ ] Conversion improvements seen?
- [ ] User feedback positive?
- [ ] Issues reported?

**Action Items**:
- [ ] Bug fixes needed?
- [ ] Performance improvements?
- [ ] Design tweaks?
- [ ] Documentation updates?

### **Monthly Review** (End of month)

**Impact Assessment**:
- **Conversion**: Did it improve 8-12% as expected?
- **Engagement**: Did session duration increase 20-30%?
- **Support**: Did tickets decrease 15-20%?
- **Accessibility**: Is 99-100% WCAG AA maintained?

**Iteration Plan**:
- What worked well?
- What could be improved?
- User feedback themes?
- Next priorities for Phase 6?

---

## 5.7 Resource Allocation & Team Structure

### **Recommended Team Composition**

**Engineering Lead** (1 FTE):
- Code review & architecture
- Database optimization
- Performance monitoring
- Technical decisions

**Frontend Developers** (2.5 FTE):
- Component implementation
- Page integration
- Testing
- Accessibility fixes

**QA Engineer** (1 FTE):
- Comprehensive testing
- Performance testing
- Accessibility audit
- Device testing

**Design Consultant** (0.25 FTE, ongoing):
- Visual refinement
- Pixel perfection
- Animation feedback
- Stakeholder presentations

**Product Manager** (0.25 FTE, ongoing):
- Requirements clarification
- Stakeholder communication
- Launch coordination
- Feedback collection

**Total**: 4.75 FTE for 9-10 weeks

**Budget Allocation**:
- Engineering: $120K-160K (3.5 FTE × $125/hr × 260 hrs)
- QA: $20K-25K (1 FTE × $125/hr × 160 hrs)
- Design: $8K-12K (0.25 FTE × $150/hr × 260 hrs)
- Infrastructure/Tools: $10K-15K
- Contingency: $15K-25K
- **Total**: $180K-250K

---

## 5.8 Risk Mitigation & Contingency Plans

### **Risk #1: Performance Degradation**

**Probability**: MEDIUM
**Impact**: HIGH
**Mitigation**:
- Weekly performance profiling during development
- Performance budgets enforced in CI/CD
- Bundle analysis tracked
- Lighthouse scores monitored

**Contingency**:
- If LCP > 3.5s detected, prioritize image optimization
- If CLS > 0.15, audit layout shifts (fonts, images)
- Lazy-load non-critical components
- Enable progressive rendering (skeleton screens)

### **Risk #2: Accessibility Compliance Gaps**

**Probability**: MEDIUM
**Impact**: HIGH
**Mitigation**:
- Monthly accessibility audits (axe-core + manual)
- Keyboard navigation tested on all pages
- Screen reader testing (NVDA, JAWS)
- Color contrast verified (WebAIM)

**Contingency**:
- If WCAG violations found post-launch:
  - Create bug fix sprint
  - Prioritize critical issues (A+)
  - Communicate timeline to users
  - Deploy fixes within 1 week

### **Risk #3: User Resistance to Change**

**Probability**: LOW
**Impact**: MEDIUM
**Mitigation**:
- Phased rollout (10% → 25% → 50% → 100%)
- In-app guide: "What's New?" tour
- Easily accessible old design (if needed)
- User feedback survey
- Social proof: Show positive user comments

**Contingency**:
- If negative feedback overwhelming:
  - Provide feedback form
  - Iterate quickly on pain points
  - Communicate improvements
  - Consider keeping old design as option

### **Risk #4: Database Migration Issues**

**Probability**: LOW
**Impact**: HIGH
**Mitigation**:
- Dry-run migrations in staging first
- Database backups before each migration
- Rollback plan documented
- Monitoring during migration window (off-peak hours)

**Contingency**:
- If migration fails:
  - Rollback to previous backup
  - Identify issue
  - Fix & re-test
  - Schedule migration during maintenance window
  - Notify users of delay

---

## 5.9 Success Criteria & Launch Sign-Off

### **Technical Sign-Off Checklist**

- [ ] Build passes without errors/warnings
- [ ] No console errors on any page (dev or prod)
- [ ] All links functional
- [ ] All forms submit correctly
- [ ] Real-time features work (chat, bids)
- [ ] API calls optimized (no N+1 queries)
- [ ] All images load and display correctly
- [ ] Focus management proper (keyboard nav works)
- [ ] Database migrations applied successfully
- [ ] Backups verified

### **QA Sign-Off Checklist**

- [ ] All critical paths tested (purchase, bid, chat)
- [ ] Edge cases handled (empty states, errors, loading)
- [ ] Responsive design verified (4 breakpoints minimum)
- [ ] Touch targets 48px+ (mobile)
- [ ] Accessibility audit passed (WCAG AA 98%+)
- [ ] Performance targets met (LCP, FID, CLS)
- [ ] No visual regressions found
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Real device testing complete (iOS, Android)
- [ ] Performance profiling completed

### **Business Sign-Off Checklist**

- [ ] Stakeholder approval obtained
- [ ] Design matches approved mockups (+ documented exceptions)
- [ ] All requirements implemented or explicitly deferred
- [ ] Timeline met or documented delays explained
- [ ] Budget within forecast or overruns approved
- [ ] Risk register reviewed & sign-off obtained
- [ ] Communication plan executed
- [ ] Go-live readiness confirmed

### **Launch Approval Form**

```
PHASE 5 IMPLEMENTATION LAUNCH APPROVAL

Date: ______________
Version: Phase 5 - Final Build

Technical Lead: _________________________ Date: _______
QA Lead: _________________________ Date: _______
Product Manager: _________________________ Date: _______
Design Lead: _________________________ Date: _______
Executive Sponsor: _________________________ Date: _______

All sign-offs obtained: ☐ YES ☐ NO

Go-Live Approved: ☐ YES ☐ NO (if NO, explain):
_________________________________________________
_________________________________________________

Rollback plan ready: ☐ YES ☐ NO
Monitoring setup: ☐ YES ☐ NO
User communication sent: ☐ YES ☐ NO

Launch Date: _______________
```

---

# 6. DOCUMENT MAINTENANCE & UPDATES

**Document Owner**: Engineering Lead
**Last Updated**: January 2024
**Version**: 1.0 - Final
**Next Review Date**: Post-launch (2 weeks after go-live)

**Update Log**:
```
Version 1.0 (Jan 2024): Initial Phase 5 documentation
  - Executive summary with KPIs
  - Technical specifications for all major components
  - Wireframes with before/after comparisons
  - Phased rollout strategy (5 phases over 10 weeks)
  - Resource allocation ($180K-$250K budget)
  - Risk mitigation & contingency plans

Changes anticipated during development:
- Third-party integrations may shift based on vendor availability
- Timeline may adjust ±1 week based on complexity discovered
- Team composition may change based on availability
- Specific component details may refine during implementation
```

---

# APPENDIX A: GLOSSARY OF TERMS

- **Component**: Reusable UI building block (e.g., Button, Card, Input)
- **Touch Target**: Clickable/tappable area; 48px × 48px recommended minimum
- **Viewport**: Device screen size; breakpoints: 360px, 640px, 768px, 1024px, 1280px, 1536px
- **WCAG**: Web Content Accessibility Guidelines; AA = satisfactory, AAA = enhanced
- **LCP**: Largest Contentful Paint; Core Web Vital measuring perceived load speed
- **FID**: First Input Delay; Core Web Vital measuring interactivity
- **CLS**: Cumulative Layout Shift; Core Web Vital measuring visual stability
- **RLS**: Row Level Security; Supabase feature for data access control
- **N+1 Query**: Performance anti-pattern; loading related data separately instead of joined
- **Feature Flag**: Code toggle allowing incremental rollout of features
- **Tree Shaking**: Build optimization removing unused code

---

**END OF PHASE 5 DOCUMENTATION**

This document serves as the official technical specification, implementation guide, and launch plan for the Agrivus Phase 5 redesign. All work must adhere to these specifications. Deviations require formal change request and stakeholder approval.

For questions or clarifications, contact: [Engineering Lead Email]
