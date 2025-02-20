import useStore from "../../zustand/store";

function Home() {
  const user = useStore((state) => state.user);
  const logOut = useStore((state) => state.logOut);

  return (
    <>
      <section className="position-relative bg-dark py-5">
        <div className="container position-relative z-2 py-2 py-sm-4">
          <div className="row py-md-2 py-lg-5 my-xxl-1">
            <div className="col-sm-8 col-md-5">
              <h2
                className="display-6 pb-1 pb-sm-2"
                style={{ color: "#bbcefd" }}
              >
                Find certified DBT provider availibility in Minnesota
              </h2>
              <p className="fs-5">
                DBTsearch is a website that allows clinicians and prospective
                clients to search for certified DBT providers in Minnesota and
                more specifically, locate providers that have current
                availability.
              </p>
              <a href="/search" className="btn btn-lg btn-primary mt-3">
                Find DBT Providers
                <i className="fi-arrow-right fs-base ms-2"></i>
              </a>
            </div>
          </div>
        </div>
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
      </section>
    </>
  );
}

export default Home;
