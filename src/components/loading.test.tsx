import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner, LoadingPage } from "./loading";

describe("Loading Components", () => {
  describe("LoadingSpinner", () => {
    it("renders with default size", () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole("status");
      const svg = spinner.querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "16"); // Default size
      expect(svg).toHaveAttribute("height", "16");
    });

    it("renders with custom size", () => {
      render(<LoadingSpinner size={20} />);
      const spinner = screen.getByRole("status");
      const svg = spinner.querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("renders loading text for screen readers", () => {
      render(<LoadingSpinner />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("LoadingPage", () => {
    it("renders full page loading spinner", () => {
      render(<LoadingPage />);
      const container = screen.getByRole("status").parentElement;

      expect(container).toHaveClass(
        "absolute",
        "top-0",
        "right-0",
        "flex",
        "h-screen",
        "w-screen",
        "items-center",
        "justify-center"
      );
    });

    it("renders larger spinner for full page", () => {
      render(<LoadingPage />);
      const svg = screen.getByRole("status").querySelector("svg");
      expect(svg).toHaveAttribute("width", "60");
      expect(svg).toHaveAttribute("height", "60");
    });
  });
});
