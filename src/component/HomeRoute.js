import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Navbar from "./Navbar";
import HomePage from "./HomePage";
import Spinner from "./Spinner";

const NFTDetails = lazy(() => import("./NFTDetails"));

const HomeRoute = () => {
  return (
    <Router>
      <div className="container-fluid header position-relative overflow-hidden p-0">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/nft-details"
            element={
              <PrivateRoute
                element={
                  <Suspense fallback={<Spinner />}>
                    <NFTDetails />
                  </Suspense>
                }
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default HomeRoute;
