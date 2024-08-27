import React from "react";
import { Link, useLocation } from "react-router-dom";
import WalletConnect from "./WalletConnect";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-light px-4 px-lg-5 py-3 py-lg-0">
      <Link className="navbar-brand p-0" to={"/"}>
        {" "}
        <h1 className="display-6 text-primary m-0">Logo</h1>
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarCollapse"
      >
        <i className="bi bi-list" />
      </button>
      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav ms-auto py-0">
          <Link
            to="/"
            className={`nav-item nav-link ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/nft-details"
            className={`nav-item nav-link ${
              location.pathname === "/nft-details" ? "active" : ""
            }`}
          >
            {" "}
            NFT
          </Link>
        </div>

        <WalletConnect />
      </div>
    </nav>
  );
};

export default Navbar;
