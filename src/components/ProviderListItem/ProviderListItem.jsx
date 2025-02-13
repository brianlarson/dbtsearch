function ProviderListItem({ item }) {
  return (
    <>
      {/* Provider list item */}
      <li className="d-sm-flex align-items-center">
        <article className="card w-100">
          {/* <div className="d-sm-none" style={{ marginTop: "-44px" }} /> */}
          <div className="row g-0">
            <div className="col-sm-4 col-md-3 rounded overflow-hidden pb-2 pb-sm-0 pe-sm-2">
              <div
                className="position-relative d-flex h-100 bg-white p-5"
                style={{ minHeight: "174px" }}
              >
                {item.image ? (
                  <>
                    <img
                      src={`/public/images/logos/${item.image}`}
                      className="position-absolute top-0 start-0 w-100 h-100 object-fit-contain px-5 py-4"
                      alt={`${item.name} logo`}
                    />
                    <div
                      className="ratio d-none d-sm-block"
                      style={{
                        fnAspectRatio: "calc(180 / 240 * 100%)",
                      }}
                    />
                    <div className="ratio ratio-16x9 d-sm-none" />
                  </>
                ) : (
                  <p className="text-dark w-100 d-flex align-items-center justify-content-center mb-0">
                    No image found
                  </p>
                )}
              </div>
            </div>
            <div className="col-sm-8 col-md-9 align-self-center">
              <div className="card-body d-flex justify-content-between p-3 py-sm-4 ps-sm-2 ps-md-3 pe-md-4 mt-n1 mt-sm-0">
                <div className="position-relative pe-3">
                  <div className="d-flex gap-2 align-items-center mb-4">
                    {item.availability && (
                      <div className="mr-4">
                        <span className="badge text-success border border-success">
                          Availability
                        </span>
                      </div>
                    )}
                    {item.dbta_certified && (
                      <div className="mr-4">
                        <span className="badge text-brand border-info border">
                          DBT-A Certified
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="h4 mb-3 text-brand">{item.name}</div>
                  <div className="d-block fs-md text-body text-decoration-none mb-3">
                    {/* 12 Civic Center Plaza #615 Mankato, MN 56001 */}
                    {`${item.address} ${item.city}, ${item.state} ${item.zip}`}
                  </div>
                  <div className="mb-0">
                    <a
                      href={`tel:${item.phone}`}
                      className="border-light-subtle fs-lg fw-bold text-light"
                    >
                      {item.phone}
                    </a>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fs-xs text-body-secondary mb-3 font-monospace">
                    Updated{" "}
                    <span className="text-secondary fw-semibold">
                      02/12/2025
                      {/* {item.updated_at} */}
                    </span>
                  </div>
                  <div className="d-flex flex-column justify-content-end gap-3 mb-3">
                    {item.website && (
                      <a
                        href={item.website}
                        className="btn btn-outline-secondary"
                        target="_blank"
                        rel="noopener"
                        title={`Visit ${item.website}`}
                      >
                        Website
                        <i className="fi-external-link fs-base ms-2 me-n1"></i>
                      </a>
                    )}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}?subject=Inquiry%20from%20DBTsearch.org`}
                        className="btn btn-outline-secondary"
                      >
                        Email
                        <i className="fi-mail fs-base ms-2 me-n1"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </li>
    </>
  );
}

export default ProviderListItem;
