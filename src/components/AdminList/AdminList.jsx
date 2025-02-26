function AdminList({ providers, handleEditClick }) {
  return (
    <>
      {/* Admin provider list */}
      <div className="vstack gap-5 px-0">
        <div className="list-group">
          {providers.map((item) => {
            return (
              <div
                key={item.id}
                className="list-group-item d-flex align-items-center justify-content-between p-4"
              >
                <div className="pe-4">
                  <div className="d-flex gap-2 align-items-center mb-3">
                    {item.availability ? (
                      <div className="mr-4">
                        <span className="badge text-success border border-success">
                          Availability
                        </span>
                      </div>
                    ) : (
                      <div className="mr-4">
                        <span className="badge text-secondary border border-secondary">
                          No Availability
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
                  <div className="fs-5 fw-semibold">{item.name}</div>
                  <div className="fs-sm text-secondary mt-1">
                    {item.address} <br />
                    {item.city}, {item.state} {item.zip}
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick(item.id)}
                  className="btn btn-secondary ml-4"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default AdminList;
