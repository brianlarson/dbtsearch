import Nav from "../Nav/Nav";

function Header() {
  return (
    <>
      {/* Global header */}
      <header
        className="navbar navbar-expand-lg bg-body navbar-sticky sticky-top z-fixed px-0"
        data-sticky-element
      >
        <div className="container">
          {/* Mobile offcanvas menu toggler (Hamburger) */}
          <button
            type="button"
            className="navbar-toggler me-3 me-lg-0"
            data-bs-toggle="offcanvas"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Navbar brand (Logo) */}
          <a
            className="navbar-brand py-1 py-md-2 py-xl-1 me-2 me-sm-n4 me-md-n5 me-lg-0"
            href="index.html"
          >
            <span className="d-flex flex-shrink-0 text-secondary rtl-flip me-2">
              <img
                src="/public/images/dbtsearch-logo.svg"
                alt="DBTsearch"
                style={{ maxWidth: "170px" }}
                className="d-md-none"
              />
              <img
                src="/public/images/dbtsearch-logo.svg"
                alt="DBTsearch"
                style={{ maxWidth: "280px" }}
                className="d-none d-md-block"
              />
            </span>
            <div className="visually-hidden">DBTsearch</div>
          </a>

          <Nav />

          {/* Button group */}
          <div className="d-flex gap-sm-1">
            {/* Contact button  */}
            <a
              className="btn btn-outline-secondary me-2 d-none d-md-inline"
              href="#"
              aria-label="Contact"
            >
              {/* <i className="fi-log-in fs-base mx-n2 me-xl-2" /> */}
              Contact
            </a>

            {/* Login button  */}
            <a
              className="btn btn-secondary fw-semibold"
              href="/login"
              aria-label="Sign in to account"
            >
              {/* <i className="fi-log-in fs-base mx-n2 me-xl-2" /> */}
              Login
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
