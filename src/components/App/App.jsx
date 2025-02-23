import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import useStore from "../../zustand/store";

import Header from "../Header/Header";
import Home from "../Home/Home";
import Providers from "../Providers/Providers";
import About from "../About/About";
import FAQs from "../FAQs/FAQs";
import Contact from "../Contact/Contact";
import Register from "../Register/Register";
import Login from "../Login/Login";
import Logout from "../Logout/Logout";
import Admin from "../Admin/Admin";
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
          <Route exact path="/providers" element={<Providers />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/faqs" element={<FAQs />} />
          <Route exact path="/contact" element={<Contact />} />
          <Route exact path="/register" element={<Register />} />
          <Route
            exact
            path="/login"
            element={user.id ? <Navigate to="/admin" replace /> : <Login />}
          />
          <Route
            exact
            path="/admin"
            element={user.id ? <Admin /> : <Navigate to="/login" replace />}
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
