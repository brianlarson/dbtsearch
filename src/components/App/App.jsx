import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import useStore from "../../zustand/store";
import Header from "../Header/Header";
import Home from "../Home/Home";
import Search from "../Search/Search";
import LoginPage from "../Login/Login";
import RegisterPage from "../Register/Register";
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
          <Route exact path="/about" element={<AboutPage />} />
          <Route exact path="/login" element={<LoginPage />} />
          <Route path="*" element={<h2>404 Page</h2>} />
          <Route
            exact
            path="/register"
            element={
              user.id ? (
                <Navigate to="/" replace /> // Redirect authenticated user.
              ) : (
                <RegisterPage /> // Render RegisterPage for unauthenticated user.
              )
            }
          />
          {/* 
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
          */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
