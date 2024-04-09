import React from "react";
import notfound from "../assets/page not found.mp4";

const PageNotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <video
        autoPlay
        loop
        muted
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        <source src={notfound} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default PageNotFound;
