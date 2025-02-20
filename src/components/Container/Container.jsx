function Container({ children }) {
  return (
    <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div className="row justify-content-center">
        <div className="col-lg-11 col-xl-10 col-xxl-9 fs-5">
          <div className="row justify-content-start">
            <div className="col-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Container;
