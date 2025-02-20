import { useState, useEffect } from "react";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";
import Container from "../Container/Container";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const register = useStore((state) => state.register);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);

  useEffect(() => {
    // Clear the auth error message when the component unmounts:
    return () => {
      setAuthErrorMessage("");
    };
  }, []);

  const handleRegister = (event) => {
    event.preventDefault();
    register({
      username: username,
      password: password,
    });
  };

  return (
    <>
      <PageHeader
        pageHeading="Register"
        pageSubheading="Add management users"
      />
      <Container>
        <form className="form" onSubmit={handleRegister}>
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
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="form-control form-control-lg"
                required
              />
            </div>
            <div className="col-12 mt-3 mb-5">
              <button type="submit" className="btn btn-lg btn-primary px-4">
                Register
              </button>
            </div>
          </div>
        </form>
      </Container>
      {
        // Conditionally render registration error:
        errorMessage && <h3>{errorMessage}</h3>
      }
    </>
  );
}

export default Register;
