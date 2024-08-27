import React, { lazy, Suspense } from "react";
import { useAccount } from "wagmi";
import Spinner from "./Spinner";

const TokenBalance = lazy(() => import("./TokenBalance"));

const HomePage = () => {
  const { isConnected } = useAccount();

  const renderElement = () => {
    return isConnected ? (
      <div className="row gy-5 align-items-center">
        <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.1s">
          <Suspense fallback={<Spinner />}>
            <TokenBalance />
          </Suspense>
        </div>
        <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s"></div>
      </div>
    ) : (
      <div className="row gy-5 align-items-center">
        <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.1s">
          <h1
            className="display-4 text-dark mb-4 wow fadeInUp"
            data-wow-delay="0.3s"
          >
            What is Lorem Ipsum?
          </h1>
          <p className="fs-4 mb-4 wow fadeInUp" data-wow-delay="0.5s">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
          <button className="btn btn-primary rounded-pill py-3 px-5 wow fadeInUp">
            Get Started
          </button>
        </div>
        <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s"></div>
      </div>
    );
  };

  return (
    <div className="hero-header overflow-hidden px-5">
      <div className="rotate-img">
        <div className="rotate-sty-2" />
      </div>
      {renderElement()}
    </div>
  );
};

export default HomePage;
