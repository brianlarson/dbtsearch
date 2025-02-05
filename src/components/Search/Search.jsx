import PageHeader from "../PageHeader/PageHeader";

function Search() {
  return (
    <>
      <PageHeader
        pageHeading="Search"
        pageSubheading="DBT Providers in Minnesota"
      />
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        {/* Provider results list */}
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9">
            <ul className="vstack gap-5 px-0">
              {/* Provider list item */}
              <li className="d-sm-flex align-items-center">
                <article className="card w-100">
                  {/* <div className="d-sm-none" style={{ marginTop: "-44px" }} /> */}
                  <div className="row g-0">
                    <div className="col-sm-4 col-md-3 rounded overflow-hidden pb-2 pb-sm-0 pe-sm-2">
                      <a
                        className="position-relative d-flex h-100 bg-white"
                        href="#!"
                        style={{ minHeight: "174px" }}
                      >
                        <img
                          src="/public/images/logos/asc-psychological-services.webp"
                          className="position-absolute top-0 start-0 w-100 h-100 object-fit-contain px-4 py-3"
                          alt="ASC Logo"
                        />
                        <div
                          className="ratio d-none d-sm-block"
                          style={{
                            fnAspectRatio: "calc(180 / 240 * 100%)",
                          }}
                        />
                        <div className="ratio ratio-16x9 d-sm-none" />
                      </a>
                    </div>
                    <div className="col-sm-8 col-md-9 align-self-center">
                      <div className="card-body d-flex justify-content-between p-3 py-sm-4 ps-sm-2 ps-md-3 pe-md-4 mt-n1 mt-sm-0">
                        <div className="position-relative pe-3">
                          <span className="badge text-success border border-success mb-3">
                            Availability
                          </span>
                          <div className="h4 mb-2 text-brand">
                            Addictions and Stress Clinic dba ASC Psychological
                            Services
                          </div>
                          <a
                            className="stretched-link d-block fs-md text-body text-decoration-none mb-2"
                            href="#!"
                          >
                            12 Civic Center Plaza #615 Mankato, MN 56001
                          </a>
                          <div className="h6 fs-lg mb-0 text-warning">
                            <a
                              href="tel:507-345-4679"
                              className="border-bottom pb-1"
                            >
                              507-345-4679
                            </a>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fs-xs text-body-secondary mb-3 font-monospace">
                            Updated{" "}
                            <span className="text-secondary fw-semibold">
                              02/05/2025
                            </span>
                          </div>
                          <div className="d-flex justify-content-end gap-2 mb-3">
                            <a href="" className="btn btn-outline-secondary">
                              Website
                              <i className="fi-external-link fs-base ms-2 me-n1"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
