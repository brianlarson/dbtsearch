import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import useStore from "../../zustand/store";
import Nav from "../Nav/Nav";
import HomePage from "../HomePage/HomePage";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";

function App() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <header>
        <h1>DBTsearch</h1>
        <Nav />
      </header>
      <main>
        <Routes>
          <Route
            exact
            path="/"
            element={
              user.id ? (
                <HomePage /> // Render HomePage for authenticated user.
              ) : (
                <Navigate to="/login" replace /> // Redirect unauthenticated user.
              )
            }
          />
          <Route
            exact
            path="/login"
            element={
              user.id ? (
                <Navigate to="/" replace /> // Redirect authenticated user.
              ) : (
                <LoginPage /> // Render LoginPage for unauthenticated user.
              )
            }
          />
          <Route
            exact
            path="/registration"
            element={
              user.id ? (
                <Navigate to="/" replace /> // Redirect authenticated user.
              ) : (
                <RegisterPage /> // Render RegisterPage for unauthenticated user.
              )
            }
          />
          <Route
            exact
            path="/about"
            element={
              <>
                <h2>About DBTsearch</h2>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Labore natus corporis consectetur quia architecto, obcaecati
                  nihil alias veritatis ad magnam voluptatibus placeat ducimus
                  incidunt porro quo assumenda reiciendis animi iusto.
                </p>
              </>
            }
          />
          <Route path="*" element={<h2>404 Page</h2>} />
        </Routes>
      </main>
      <footer>
        <p>Copyright © {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}

export default App;
