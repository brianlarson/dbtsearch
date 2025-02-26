import { useEffect, useState } from "react";
import axios from "axios";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";
import AdminList from "../AdminList/AdminList";
import AdminEdit from "../AdminEdit/AdminEdit";

function Admin() {
  const [editing, setEditing] = useState(false);
  const {
    user,
    providers,
    providerEdit,
    fetchAdminProviders,
    editAdminProvider,
    logOut,
  } = useStore((store) => ({
    user: store.user,
    providers: store.providers,
    providerEdit: store.providerEdit,
    fetchAdminProviders: store.fetchAdminProviders,
    editAdminProvider: store.editAdminProvider,
    logOut: store.logOut,
  }));

  useEffect(() => {
    if (user && user.id) {
      fetchAdminProviders(user.id);
    }
  }, [fetchAdminProviders, user]);

  const handleEditClick = (id) => {
    setEditing(true);
    editAdminProvider(id);
  };

  const handleCancelClick = () => {
    setEditing(false);
    // editAdminProvider(id);
  };

  return (
    <>
      <PageHeader pageHeading="Admin" pageSubheading="Provider Management" />
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9">
            {/* Admin heading */}
            <div className="pb-4 d-md-flex align-items-center justify-content-between w-100">
              <h1 className="h3 mb-2">
                {editing ? "Edit Provider" : "My Providers"}
              </h1>
              <div className="mt-0 text-light-subtle mb-n1">
                <em>Logged in as {user.username}</em>
                <button
                  onClick={() => logOut()}
                  className="btn btn-sm btn-outline-secondary ms-3"
                >
                  <i className="fi-lock fs-base me-2"></i>
                  Logout
                </button>
              </div>
            </div>

            {/* Admin provider listing & editing */}
            {editing ? (
              <AdminEdit
                providerEdit={providerEdit}
                handleCancelClick={handleCancelClick}
              />
            ) : (
              <AdminList
                providers={providers}
                handleEditClick={handleEditClick}
              />
            )}

            {/* Space */}
            <div className="my-5"></div>
            <div className="py-5"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
