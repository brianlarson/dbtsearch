import { useState, useEffect } from "react";
import axios from "axios";

function AdminEdit({ providerEdit, handleCancelClick, editing, setEditing }) {
  // console.log("providerEdit", providerEdit);
  const provider = providerEdit[0] || {};

  const [name, setName] = useState(provider.name || "");
  const [availability, setAvailability] = useState(
    provider.availability || false
  );

  useEffect(() => {
    if (providerEdit.length > 0) {
      setName(providerEdit[0].name || "");
      setAvailability(providerEdit[0].availability || false);
    }
  }, [providerEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "name") {
      setName(value);
    } else if (name === "availability") {
      setAvailability(checked);
    }
    // console.log(name, value, type, checked);
  }

  function updateProvider(id, data) {
    // console.log(id, data);
    axios({
      method: "PUT",
      url: `/api/provider/edit/update/${id}`,
      data: data,
    })
      .then((res) => {
        console.log("updateProvider", res.data);
        setEditing(false);
      })
      .catch((err) => {
        console.error("updateProvider", err);
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { name, availability } = e.target;
    const data = {
      name: name.value,
      availability: availability.checked ? true : false,
    };
    // console.log("submitting", data.name, data.availability);
    updateProvider(provider.id, data);
  }

  return (
    <>
      {/* Admin provider edit form */}
      <div className="vstack gap-5 px-0">
        <div className="list-group">
          <div className="list-group-item p-4">
            <div className="pe-4">
              <h3 className="fs-5 mb-4 fw-semibold">{name}</h3>
              <form onSubmit={handleSubmit} className="form">
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      onChange={handleChange}
                      value={name}
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
                        checked={availability ?? "checked"}
                        id="availability"
                        name="availability"
                        type="checkbox"
                        className="form-check-input"
                      />
                      <label
                        htmlFor="availability"
                        className="form-check-label"
                      >
                        Has availability
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
