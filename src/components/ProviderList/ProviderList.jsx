import ProviderListItem from "../ProviderListItem/ProviderListItem";

function ProviderList() {
  return (
    <>
      {/* Provider list */}
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9">
            <ul className="vstack gap-5 px-0">
              <ProviderListItem />
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProviderList;
