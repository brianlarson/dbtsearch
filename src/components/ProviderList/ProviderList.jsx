import ProviderListItem from "../ProviderListItem/ProviderListItem";

function ProviderList({ providers, handleShowChange }) {
  return (
    <>
      {/* Provider list */}
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9">
            <div className="form-check form-switch pb-2 mb-lg-4">
              <input
                onChange={handleShowChange}
                type="checkbox"
                className="form-check-input"
                role="switch"
                id="availability-input"
                defaultChecked
              />
              <label
                htmlFor="availability-input"
                className="form-check-label ms-1"
              >
                Only show providers with availability
              </label>
            </div>
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
