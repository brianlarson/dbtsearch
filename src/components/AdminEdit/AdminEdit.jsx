import { useState } from "react";

function AdminEdit({ providerEdit, handleCancelClick }) {
  console.log("providerEdit", providerEdit);
  const provider = providerEdit[0] || {};

  const [name, setName] = useState(provider.name);
  const [availability, setAvailability] = useState(provider.availability);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
      console.log(name, value);
    } else if (name === "availability") {
      setAvailability(!availability);
    }
  }

  return (
    <>
      {/* Admin provider edit form */}
      <div className="vstack gap-5 px-0">
        <div className="list-group">
          <div className="list-group-item p-4">
            <div className="pe-4">
              <h3 className="fs-5 mb-4 fw-semibold">{name}</h3>
              <form action="" className="form">
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      onChange={handleChange}
                      defaultValue={name}
                      id="name"
                      name="name"
                      type="text"
                      className="form-control w-full"
                    />
                  </div>
                  <div className="col-md-8 mb-3">
                    <div className="form-check">
                      <input
                        onChange={handleChange}
                        checked={availability}
                        id="availability"
                        name="availability"
                        type="checkbox"
                        className="form-check-input"
                      />
                      <label
                        htmlFor="availability"
                        className="form-check-label"
                      >
                        Currently has availability
                      </label>
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="btn btn-secondary d-inline me-3"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelClick}
                        className="btn btn-outline-secondary d-inline me-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminEdit;
