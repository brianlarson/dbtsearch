function Footer() {
  return (
    <footer className="footer bg-body border-top my-5">
      <div className="container pt-5">
        <p className="text-center fw-thin fs-6 mb-3">
          <span className="fw-bold">DBTsearch</span> is powered by{" "}
          <a
            href="https://www.tinytreecounseling.com/"
            className="text-brand"
            style={{ textDecorationThickness: "1px" }}
            target="_blank"
          >
            Tiny Tree Counseling & Consulting
          </a>
        </p>
        <p className="small text-body-secondary text-center mb-0">
          &copy;{new Date().getFullYear()} DBT Search and dbtsearch.org. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
