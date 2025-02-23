import ProviderListItem from "../ProviderListItem/ProviderListItem";

function ProviderList({ providers }) {
  return (
    <>
      {/* Provider list */}
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9">
            <div class="form-check form-switch pb-2 mb-lg-4">
              <input
                type="checkbox"
                className="form-check-input"
                role="switch"
                id="availability-input"
                defaultChecked
              />
              <label for="availability-input" className="form-check-label ms-1">
                Only show providers with current availability
              </label>
            </div>
            {/* <div className="form-check mb-3 mb-lg-4">
              <input
                type="checkbox"
                className="form-check-input form-input-lg"
                id="ex-check-1"
                checked
              />
              <label for="ex-check-1" className="form-check-label ms-1 fs-md">
                Only show providers with availability
              </label>
            </div> */}
            <ul className="vstack gap-5 px-0">
              {providers.map((item) => (
                <ProviderListItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProviderList;
