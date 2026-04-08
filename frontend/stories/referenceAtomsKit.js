/**
 * Finder/Bootstrap atoms matching `docs/reference-markup/*.html` patterns.
 * Render inside `.finder-directory` (see `Atoms/Reference/Finder` stories).
 */

export function renderFinderTypographySample() {
  return `
<section class="container py-4">
  <h2 class="h5 text-body-secondary border-bottom pb-2 mb-4">Headings</h2>
  <h1 class="display-6 pb-2">Display 6</h1>
  <h1 class="h1">Heading 1</h1>
  <h2 class="h2">Heading 2</h2>
  <h3 class="h3 text-brand">Heading 3 — .text-brand</h3>
  <h4 class="h4">Heading 4</h4>
  <h5 class="h5 text-secondary">Heading 5 — .text-secondary</h5>
  <h6 class="h6">Heading 6</h6>
  <p class="lead">Lead paragraph — larger body intro.</p>
  <p class="fs-5">fs-5 body (reference inner pages).</p>
  <p class="text-body">Default body (.text-body).</p>
  <p class="text-body-secondary small">Secondary / caption (.text-body-secondary)</p>
</section>`;
}

export function renderFinderButtonsSample() {
  return `
<section class="container py-4">
  <h2 class="h5 text-body-secondary border-bottom pb-2 mb-4">Buttons</h2>
  <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
    <button type="button" class="btn btn-primary">Primary</button>
    <button type="button" class="btn btn-secondary">Secondary</button>
    <button type="button" class="btn btn-outline-secondary">Outline secondary</button>
  </div>
  <div class="d-flex flex-wrap gap-2 align-items-center">
    <button type="button" class="btn btn-lg btn-primary px-4">Large primary</button>
    <a class="btn btn-lg btn-primary d-inline-flex align-items-center" href="#">Large primary link</a>
  </div>
</section>`;
}

export function renderFinderFormsSample() {
  return `
<section class="container py-4">
  <h2 class="h5 text-body-secondary border-bottom pb-2 mb-4">Form controls</h2>
  <form class="form" onsubmit="return false">
    <div class="row gap-3">
      <div class="col-md-8">
        <label for="ref-username" class="form-label fs-base">Username</label>
        <input id="ref-username" type="text" class="form-control form-control-lg" autocomplete="off" placeholder="username" />
      </div>
      <div class="col-md-8">
        <label for="ref-password" class="form-label fs-base">Password</label>
        <input id="ref-password" type="password" class="form-control form-control-lg" autocomplete="off" value="" />
      </div>
      <div class="col-12">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ref-switch" checked />
          <label class="form-check-label" for="ref-switch">Example switch</label>
        </div>
      </div>
      <div class="col-12 mt-2">
        <button type="submit" class="btn btn-lg btn-primary px-4">Submit</button>
      </div>
    </div>
  </form>
</section>`;
}

export function renderFinderBadgesSample() {
  return `
<section class="container py-4">
  <h2 class="h5 text-body-secondary border-bottom pb-2 mb-4">Badges</h2>
  <div class="d-flex flex-wrap gap-2">
    <span class="badge fs-sm text-success border border-success">Availability</span>
    <span class="badge fs-sm text-secondary border border-secondary">No Availability</span>
    <span class="badge fs-sm text-info border border-info">DBT-A Certified</span>
  </div>
</section>`;
}

export function renderFinderLinksSample() {
  return `
<section class="container py-4">
  <h2 class="h5 text-body-secondary border-bottom pb-2 mb-4">Links &amp; brand</h2>
  <p class="mb-2"><a href="#">Default link</a></p>
  <p class="mb-2"><a class="text-brand" href="#">Brand link (.text-brand)</a></p>
  <p class="fs-base">Inline <a class="text-brand" href="#">login again</a> reference.</p>
</section>`;
}
