import { useState, useEffect } from "react";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";
import Container from "../Container/Container";

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
    console.log(username, password);
    logIn({
      username: username,
      password: password,
    });
  };

  return (
    <>
      <PageHeader
        pageHeading="Provider Login"
        pageSubheading="Manage Listings"
      />
      <Container>
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
              <button type="submit" className="btn btn-lg btn-primary px-4">
                Log In
              </button>
            </div>
          </div>
        </form>
      </Container>
      {
        // Conditionally render login error:
        errorMessage && <h3>{errorMessage}</h3>
      }
    </>
  );
}

export default Login;
