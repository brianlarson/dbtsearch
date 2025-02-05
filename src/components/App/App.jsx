import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import useStore from "../../zustand/store";
import Header from "../Header/Header";
import Home from "../Home/Home";
import Search from "../Search/Search";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";
import Footer from "../Footer/Footer";

function App() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <Header />
      <main className="content-wrapper">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/search" element={<Search />} />
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
      <Footer />
    </>
  );
}

export default App;
