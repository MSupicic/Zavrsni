import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const Navbar = () => {
  const [searchInput, setSearchInput] = useState("");
  const { signOut } = useAuth();
  const router = useRouter(); // Import Next.js router

  const { data } = api.profile.getUserByUsername.useQuery({
    username: searchInput,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (data) {
        router.push(`/@${searchInput}`); // Redirect to /@{name}
        setSearchInput(""); // Clear input after submission
      }
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="cursor-pointer text-2xl font-bold text-white">
              Svi popravci na jednom mjestu
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-64 rounded-full px-4 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Search..."
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-purple-500 px-3 py-1 text-white hover:bg-purple-600 focus:outline-none"
              >
                Search
              </button>
            </form>
          </div>

          {/* Menu Items */}
          <div className="hidden space-x-6 md:flex">
            <a
              href="http://localhost:3000/"
              className="font-medium text-white transition hover:text-gray-300"
            >
              Posts
            </a>
            <a
              href="about"
              className="font-medium text-white transition hover:text-gray-300"
            >
              About Us
            </a>
            <a href="http://localhost:3000/">
              <button
                onClick={() => {
                  signOut(); // Sign out the user when the button is clicked
                }}
                className="rounded-full bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
