import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

const Navbar = () => {
  const [searchInput, setSearchInput] = useState("");
  const { signOut } = useAuth();
  const router = useRouter();

  const { data } = api.profile.getUserByUsername.useQuery({
    username: searchInput,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (data) {
        void router.push(`/@${searchInput}`);
        setSearchInput("");
      }
    }
  };

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <nav className="border-b border-slate-700 bg-slate-800 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="cursor-pointer text-2xl font-bold text-white transition hover:text-slate-200">
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
                className="block w-64 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-lg bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700 focus:outline-none"
              >
                Search
              </button>
            </form>
          </div>

          {/* Menu Items */}
          <div className="hidden items-center space-x-6 md:flex">
            <a
              href="about"
              className="font-medium text-slate-200 transition hover:text-white"
            >
              O nama
            </a>
            <a
              href="http://localhost:3000/"
              className="font-medium text-slate-200 transition hover:text-white"
            >
              Oglasi
            </a>

            <a href="http://localhost:3000/">
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
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
