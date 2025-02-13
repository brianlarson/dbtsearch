import { useState, useEffect } from "react";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logIn = useStore((state) => state.logIn);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  useEffect(() => {
    // Clear the auth error message when the component unmounts:
    return () => {
      setAuthErrorMessage("");
    };
  }, []);

  const handleLogIn = (event) => {
    event.preventDefault();

    logIn({
      username: username,
      password: password,
    });
  };

  return (
    <>
      <PageHeader pageHeading="Login" pageSubheading="DBT Search Management" />
      <div className="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
        <div className="row justify-content-center">
          <div className="col-lg-11 col-xl-10 col-xxl-9 fs-5">
            <div className="row justify-content-start">
              <div className="col-8">
                <form className="form" onSubmit={handleLogIn}>
                  <div className="row gap-3">
                    <div className="col-md-8">
                      <label htmlFor="username" className="form-label fs-base">
                        Username
                      </label>
                      <input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        className="form-control form-control-lg"
                        required
                      />
                    </div>
                    <div className="col-md-8">
                      <label htmlFor="password" className="form-label fs-base">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control form-control-lg"
                      />
                    </div>
                    <div className="col-12 mt-3 mb-5">
                      <button
                        className="btn btn-lg btn-primary px-4"
                        type="submit"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        // Conditionally render login error:
        errorMessage && <h3>{errorMessage}</h3>
      }
    </>
  );
}

export default Login;
