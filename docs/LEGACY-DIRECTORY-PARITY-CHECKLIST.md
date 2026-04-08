# Legacy Directory Parity Checklist (Source of Truth)

Use this checklist when refining the Vue + Preline directory UI.  
**Goal:** match legacy look-and-feel as closely as practical while using current Tailwind/Preline architecture — **not** pixel-perfect parity with Bootstrap reference HTML; `docs/reference-markup/` is structure/copy guidance. Prefer locking changes in **Tailwind** Storybook stories (`Layouts/Vue/LegacyContent`, directory kit), then applying in `app/`.

## Legacy source files

- `src/components/Header/Header.jsx`
- `src/components/PageHeader/PageHeader.jsx`
- `src/components/ProviderList/ProviderList.jsx`
- `src/components/ProviderListItem/ProviderListItem.jsx`
- `src/components/Footer/Footer.jsx`
- snapshot markup: `docs/reference-markup/` (`README.md` indexes files; regenerate with `npm run capture:markup`)

## Storybook targets

- `Pages/DirectoryPageView`
- `Organisms/Legacy Header`
- `Organisms/Directory/LegacyPageHeader`
- `Organisms/Directory/LegacyFooter`
- `Organisms/Directory/ProviderCard`
- `Organisms/Directory/ProviderList`
- `Molecules/Directory/DirectoryFilters`

## Parity checklist

### 1) Global header

- [x] Logo scale and placement match legacy intent (compact mobile, larger desktop)
- [x] Sticky header behavior and divider treatment are visually equivalent
- [x] Nav order/labels match legacy (`Providers`, `About`, `FAQs`)
- [x] Right-side action cluster mirrors legacy priority (`Contact`, `Login/Admin`)

### 2) Decorative page header strip

- [ ] Right-side hero image treatment matches legacy composition
- [ ] Mobile dark overlay behavior preserved
- [ ] H1/H2 row spacing + divider mimic legacy rhythm

### 3) Filters row

- [ ] Availability switch prominence matches legacy “first control”
- [ ] Label wording exactly: “Only show providers with availability”
- [ ] Vertical spacing between filters and list mirrors legacy

### 4) Provider card/list

- [ ] Badge language/order matches legacy (`Availability`, `No Availability`, `DBT-A Certified`)
- [ ] Title/address/phone hierarchy matches legacy emphasis
- [ ] Action buttons (`Website`, `Email`) match legacy placement and weight
- [ ] “Last updated” block location and contrast match legacy pattern
- [ ] Logo/fallback region proportions match legacy card image column

### 5) Footer

- [ ] Attribution copy matches legacy wording
- [ ] Brand link styling resembles legacy `text-brand` treatment
- [ ] Footer spacing and top border align with page rhythm

## Rules for refinement

1. Legacy files above are the visual baseline.
2. Prefer Storybook-first tweaks, then apply same changes to Vue app components.
3. If a change improves accessibility/responsiveness but deviates from legacy, document the reason in PR notes.
