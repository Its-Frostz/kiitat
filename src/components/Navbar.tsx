"use client";


import "./Styling/Navbar.css";

export default function NavBar() {

  return (
    <div className="navcontainer">
      <div className="nav">
        <div className="kiit-logo" />
        <div className="hamberger"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M4 8l16 0"></path><path d="M4 16l16 0"></path></svg></div>
        <div className="navLinks">
          <p className="navItems">Home</p>
          {/* <p className="navItems">About</p> */}
          {/* <p className="NavItems">Services</p>
                <p className="NavItems">Contact</p> */}
        </div>
      </div>
    </div>
  );
}
