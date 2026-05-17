import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from ".";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("renders disabled button", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole("button", { name: /test/i });
    expect(button).toHaveClass("custom-class");
  });

  it("applies size classes for xs", () => {
    render(<Button size="xs">Small</Button>);
    const button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-7", "text-xs");
  });

  it("applies icon-only size classes", () => {
    render(<Button size="m" icon="pi pi-check" aria-label="Confirm" />);
    const button = screen.getByRole("button", { name: /confirm/i });
    expect(button).toHaveClass("h-10", "w-10", "p-0");
  });

  it("handles click events", async () => {
    const handleClick = vi.fn();
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByRole("button", { name: /click/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
