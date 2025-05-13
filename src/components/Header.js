import React from "react";
import fcds from "../assets/images/FCDS.png";
function Header() {
  return (
    <header
      className=" d-flex align-items-center"
      style={{
        backgroundColor: "rgba(255, 255, 255, 1)",
        height: "112px",
        boxShadow: " 0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}
    >
      <div className="container d-flex align-items-center">
        <div>
          <img
            className="navbar-brand"
            src={fcds}
            style={{ width: "165px", height: "125px" }}
          />
        </div>
        <div
          style={{
            width: "50%",
            boxShadow: "-3px -1px 20px 0px rgba(0, 0, 0, 0.09)",
            borderRadius: "10px",
          }}
        ></div>
      </div>
    </header>
  );
}

export default Header;
