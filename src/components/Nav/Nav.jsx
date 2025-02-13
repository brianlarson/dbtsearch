import { NavLink } from "react-router-dom";
import useStore from "../../zustand/store";

function Nav() {
  const user = useStore((store) => store.user);
  return (
    <>
      {/* Main navigation */}
      <nav
        className="offcanvas offcanvas-start"
        id="navbarNav"
        tabIndex={-1}
        aria-labelledby="navbarNavLabel"
      >
        <div className="offcanvas-header py-3">
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body pt-2 pb-4 py-lg-0 mx-lg-auto">
          <ul className="navbar-nav position-relative">
            <li className="nav-item py-lg-2 me-lg-n2 me-xl-0">
              <NavLink to="/search" className="nav-link">
                Search
              </NavLink>
            </li>
            <li className="nav-item py-lg-2 me-lg-n2 me-xl-0">
              <NavLink to="/about" className={"nav-link"}>
                About
              </NavLink>
            </li>
            <li className="nav-item py-lg-2 me-lg-n2 me-xl-0">
              <NavLink to="/faqs" className="nav-link">
                FAQs
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Nav;
