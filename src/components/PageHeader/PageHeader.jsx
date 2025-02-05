function PageHeader({ pageHeading, pageSubheading }) {
  return (
    <>
      {/* Decorative header/hero for internal pages */}
      <div className="position-relative bg-dark py-5" aria-hidden="true">
        <div className="container position-relative z-2 py-2 py-sm-1" />
        <div className="row position-absolute top-0 end-0 w-100 h-100 justify-content-end g-0">
          <div className="col-md-6 position-relative">
            <img
              src="/public/images/pexels-steve-1690351.jpg"
              className="position-absolute top-0 end-0 w-100 h-100 object-fit-cover"
              alt="Abstract paintingPhoto by Steve Johnson on pexels.com - 'abstract-painting-1690351'"
            />
          </div>
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-black z-1 opacity-50 d-md-none" />
        </div>
      </div>

      {/* Page heading(s) */}
      <div className="container my-4 my-md-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9">
            <div className="row">
              {pageHeading && (
                <div className="col-md-6 pb-1">
                  <h1 className="h2 m-0">{pageHeading}</h1>
                </div>
              )}
              {pageSubheading && (
                <div className="col-md-6 row mx-0 pb-1 align-items-end justify-content-end px-0">
                  <h2 className="h5 text-secondary fw-medium m-0 text-md-end">
                    {pageSubheading}
                  </h2>
                </div>
              )}
            </div>
            <hr className="mt-0" />
            {/* <div className="pt-2 pt-lg-3 fs-5"></div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default PageHeader;
