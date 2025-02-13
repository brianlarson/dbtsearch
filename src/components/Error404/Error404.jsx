import PageHeader from "../PageHeader/PageHeader";

function Error404() {
  return (
    <>
      <PageHeader pageHeading="Error 404" pageSubheading="Page Not Found" />
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9 fs-5">
            <div className="row justify-content-start">
              <div className="col-8 mb-5">
                {/* Page content */}
                <p className="pb-5">
                  The resource you're looking for doesn't exist, has been
                  removed or no longer exists. Total bummer, dude.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Error404;
