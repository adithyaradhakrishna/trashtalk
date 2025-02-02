import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-[rgb(24,38,104)] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-white text-xl font-bold cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Trash Talk
        </h1>

        {/* Hamburger Icon (Mobile) */}
        <button
          className="lg:hidden text-white p-2"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Navbar Links (Desktop) */}
        <div className="hidden lg:flex space-x-4">
          <button onClick={() => navigate("/home")} className="text-white hover:underline">
            Home
          </button>
          <button onClick={() => navigate("/post")} className="text-white hover:underline">
            New Post
          </button>
          <button onClick={() => navigate("/chatroom")} className="text-white hover:underline">
            Chatroom
          </button>
          <button
            onClick={handleLogout}
            className="text-[rgb(24,38,104)] bg-white px-4 py-2 rounded hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="flex flex-col space-y-2 mt-2 bg-[rgb(24,38,104)] p-4 rounded-lg shadow-md">
          <button
            onClick={() => {
              navigate("/home");
              setIsOpen(false);
            }}
            className="text-white hover:underline"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate("/post");
              setIsOpen(false);
            }}
            className="text-white hover:underline"
          >
            New Post
          </button>
          <button
            onClick={() => {
              navigate("/chatroom");
              setIsOpen(false);
            }}
            className="text-white hover:underline"
          >
            Chatroom
          </button>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="text-[rgb(24,38,104)] bg-white px-4 py-2 rounded hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Header;
