import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import useStore from "../../zustand/store";

import Header from "../Header/Header";
import Home from "../Home/Home";
import Search from "../Search/Search";
import About from "../About/About";
import FAQs from "../FAQs/FAQs";
import Contact from "../Contact/Contact";
import Login from "../Login/Login";
import Register from "../Register/Register";
import Footer from "../Footer/Footer";
import Error404 from "../Error404/Error404";

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
          <Route exact path="/about" element={<About />} />
          <Route exact path="/faqs" element={<FAQs />} />
          <Route exact path="/contact" element={<Contact />} />
          <Route exact path="/login" element={<Login />} />
          <Route path="*" element={<Error404 />} />
          <Route
            exact
            path="/register"
            element={
              user.id ? (
                <Navigate to="/" replace /> // Redirect authenticated user.
              ) : (
                <Register /> // Render RegisterPage for unauthenticated user.
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
