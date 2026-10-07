import { describe, it, expect } from "vitest";
import { inventory } from "../data/inventory";
import {
  calculatePayment,
  emptyFilters,
  filterVehicles,
  options,
} from "./inventory";
describe("inventory adapter helpers", () => {
  it("derives makes and models from inventory", () => {
    expect(options(inventory, "make")).toHaveLength(8);
    expect(
      options(
        inventory.filter((v) => v.make === "BMW"),
        "model",
      ),
    ).toEqual(["3 Series", "X3", "X5", "i4"]);
    expect(options([], "make")).toEqual([]);
  });
  it("combines make, model, price, years, mileage and drivetrain", () => {
    const matches = filterVehicles(inventory, {
      ...emptyFilters,
      make: "BMW",
      model: "X5",
      yearMin: "2021",
      yearMax: "2025",
      priceMax: "50000",
      mileage: "50000",
      drivetrain: "AWD",
    });
    expect(matches.map((v) => v.model)).toEqual(["X5"]);
    expect(
      filterVehicles(inventory, { ...emptyFilters, priceMax: "1" }),
    ).toEqual([]);
  });
  it("sorts and selects favorites", () => {
    const matches = filterVehicles(inventory, {
      ...emptyFilters,
      sort: "price-asc",
    });
    expect(matches[0].price).toBe(19900);
    expect(
      filterVehicles(inventory, { ...emptyFilters, saved: true }, [
        "demo-1",
      ]).map((v) => v.id),
    ).toEqual(["demo-1"]);
  });
});
describe("payment estimate", () => {
  it("calculates amortization and zero APR", () => {
    expect(
      calculatePayment(30000, {
        down: 5000,
        trade: 0,
        fees: 0,
        term: 60,
        apr: 6,
      }).monthly,
    ).toBeCloseTo(483.32, 2);
    expect(
      calculatePayment(30000, { down: 0, trade: 0, fees: 0, term: 60, apr: 0 })
        .monthly,
    ).toBe(500);
  });
  it("clamps principal and handles excessive down/trade values", () => {
    expect(
      calculatePayment(30000, {
        down: 50000,
        trade: 20000,
        fees: 0,
        term: 60,
        apr: 7.9,
      }),
    ).toEqual({ principal: 0, monthly: 0 });
    expect(
      calculatePayment(30000, {
        down: -10,
        trade: -1,
        fees: -500,
        term: 60,
        apr: 0,
      }).principal,
    ).toBe(30000);
  });
});
