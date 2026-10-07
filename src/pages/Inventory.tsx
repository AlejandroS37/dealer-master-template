import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";
import { useDealer } from "../lib/store";
import {
  emptyFilters,
  filterVehicles,
  options,
  type Filters,
} from "../lib/inventory";
import { MakeMark, Modal, PageHeading } from "../components/Common";
import { VehicleCard } from "../components/VehicleCard";
import { dealerConfig } from "../config/dealerConfig";
import { riseTo } from "../lib/motion";
export default function Inventory() {
  const { vehicles, saved, loading, error } = useDealer();
  const [params, setParams] = useSearchParams();
  const resultsContainer = useRef<HTMLElement>(null);
  const firstFilterRender = useRef(true);
  const parseParams = (query: URLSearchParams): Filters =>
    ({
      ...emptyFilters,
      ...Object.fromEntries(query),
      saved: query.get("saved") === "1",
    }) as Filters;
  const [filters, setFilters] = useState<Filters>(() => parseParams(params));
  const ownQueries = useRef(new Set<string>());
  const latestQuery = useRef<string | null>(null);
  const [sheet, setSheet] = useState<"make" | "model" | "filter">();
  useEffect(() => {
    const query = params.toString();
    if (ownQueries.current.has(query)) {
      ownQueries.current.delete(query);
      if (latestQuery.current === query) ownQueries.current.clear();
      return;
    }
    setFilters(parseParams(params));
  }, [params]);
  const update = (nextFilters: Filters) => {
    setFilters(nextFilters);
    const next = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && value !== emptyFilters[key as keyof Filters])
        next.set(key, value === true ? "1" : String(value));
    });
    latestQuery.current = next.toString();
    ownQueries.current.add(next.toString());
    setParams(next, { replace: true });
  };
  const reset = () => update({ ...emptyFilters });
  const set = (key: keyof Filters, value: string | boolean) =>
    update({
      ...filters,
      [key]: value,
      ...(key === "make" ? { model: "" } : {}),
    });
  const results = filterVehicles(vehicles, filters, saved);
  const makes = options(vehicles, "make");
  const models = options(
    vehicles.filter((v) => !filters.make || v.make === filters.make),
    "model",
  );
  useEffect(() => {
    if (firstFilterRender.current) {
      firstFilterRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const container = resultsContainer.current;
      const headerHeight =
        document.querySelector(".header")?.getBoundingClientRect().height || 0;
      if (
        container &&
        container.getBoundingClientRect().top < headerHeight - 150
      ) {
        const top =
          container.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          20;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [
    filters.make,
    filters.model,
    filters.keyword,
    filters.priceMin,
    filters.priceMax,
    filters.yearMin,
    filters.yearMax,
    filters.mileage,
    filters.bodyStyle,
    filters.drivetrain,
    filters.transmission,
    filters.fuelType,
    filters.saved,
  ]);
  const makePanel = (
    <>
      <button className="all-makes" onClick={() => set("make", "")}>
        <ArrowLeft size={15} /> All makes
      </button>
      {makes.map((make) => (
        <button
          key={make}
          className={`make-option ${filters.make === make ? "selected" : ""}`}
          onClick={(e) => {
            const mark = e.currentTarget.querySelector(
              ".make-monogram, .make-logo",
            ) as HTMLElement;
            if (mark)
              riseTo(
                mark,
                ".selected-make .make-monogram, .selected-make .make-logo",
              );
            set("make", make);
            setSheet(undefined);
          }}
        >
          <MakeMark make={make} />
          <span>{make}</span>
          <small>{vehicles.filter((v) => v.make === make).length}</small>
        </button>
      ))}
    </>
  );
  const filterPanel = (
    <div className="filter-fields">
      <div className="filter-title">
        <h3>Refine your search</h3>
        <button onClick={() => reset()}>Reset</button>
      </div>
      <label>
        Keyword
        <div className="search-field">
          <Search size={15} />
          <input
            placeholder="Search vehicles"
            value={filters.keyword}
            onChange={(e) => set("keyword", e.target.value)}
          />
        </div>
      </label>
      <div className="field-pair">
        <label>
          Year from
          <input
            type="number"
            min="1900"
            max="2100"
            value={filters.yearMin}
            onChange={(e) => set("yearMin", e.target.value)}
            placeholder="Any"
          />
        </label>
        <label>
          Year to
          <input
            type="number"
            min="1900"
            max="2100"
            value={filters.yearMax}
            onChange={(e) => set("yearMax", e.target.value)}
            placeholder="Any"
          />
        </label>
      </div>
      <div className="field-pair">
        <label>
          Min price
          <input
            type="number"
            min="0"
            value={filters.priceMin}
            onChange={(e) => set("priceMin", e.target.value)}
            placeholder="$0"
          />
        </label>
        <label>
          Max price
          <input
            type="number"
            min="0"
            value={filters.priceMax}
            onChange={(e) => set("priceMax", e.target.value)}
            placeholder="Any"
          />
        </label>
      </div>
      <label>
        Maximum mileage
        <input
          type="number"
          min="0"
          value={filters.mileage}
          onChange={(e) => set("mileage", e.target.value)}
          placeholder="Any mileage"
        />
      </label>
      {(["bodyStyle", "drivetrain", "transmission", "fuelType"] as const).map(
        (key) => (
          <label key={key}>
            {
              {
                bodyStyle: "Body style",
                drivetrain: "Drivetrain",
                transmission: "Transmission",
                fuelType: "Fuel type",
              }[key]
            }
            <select
              value={filters[key]}
              onChange={(e) => set(key, e.target.value)}
            >
              <option value="">Any</option>
              {options(vehicles, key).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ),
      )}
      <label className="check-label">
        <input
          type="checkbox"
          checked={filters.saved}
          onChange={(e) => set("saved", e.target.checked)}
        />{" "}
        Saved vehicles only
      </label>
    </div>
  );
  return (
    <div className="inventory-page">
      <PageHeading
        eyebrow="FIND YOUR NEXT CHAPTER"
        title="The collection."
        description="Exceptional choices. A drive that’s distinctly yours."
      />
      <div className="mobile-filter-bar">
        <button onClick={() => setSheet("make")}>
          Make <span>{filters.make || "All"}</span>
        </button>
        <button onClick={() => setSheet("model")}>
          Model <span>{filters.model || "All"}</span>
        </button>
        <button onClick={() => setSheet("filter")}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>
      <div className="inventory-layout">
        <aside className="makes-sidebar">
          <span className="eyebrow">BY MANUFACTURER</span>
          {filters.make && (
            <div className="sidebar-model-control">
              <span className="eyebrow">{filters.make}</span>
              <label>
                Model
                <select
                  aria-label="Sidebar model"
                  value={filters.model}
                  onChange={(e) => set("model", e.target.value)}
                >
                  <option value="">All models</option>
                  {models.map((model) => (
                    <option key={model}>{model}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {makePanel}
        </aside>
        <section
          className="inventory-results"
          aria-label="Vehicle results"
          ref={resultsContainer}
        >
          {filters.make && (
            <div className="selected-make" key={filters.make}>
              <MakeMark make={filters.make} />
              <div>
                <span className="eyebrow">
                  EXPLORE {filters.make.toUpperCase()}
                </span>
                <div className="model-pills">
                  <button
                    className={!filters.model ? "selected" : ""}
                    onClick={() => set("model", "")}
                  >
                    All models
                  </button>
                  {models.map((model) => (
                    <button
                      key={model}
                      className={filters.model === model ? "selected" : ""}
                      onClick={() => set("model", model)}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="results-toolbar">
            <span aria-live="polite">
              <b>{results.length}</b> vehicles{" "}
              {dealerConfig.demoMode && (
                <span className="muted">· Sample inventory</span>
              )}
            </span>
            <label>
              Sort by{" "}
              <select
                aria-label="Sort vehicles"
                value={filters.sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                {[
                  ["recent", "Recently added"],
                  ["price-asc", "Price: low to high"],
                  ["price-desc", "Price: high to low"],
                  ["mileage", "Mileage: low to high"],
                  ["year-desc", "Year: newest first"],
                  ["year-asc", "Year: oldest first"],
                ].map(([v, label]) => (
                  <option value={v} key={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="active-filters">
            {Object.entries(filters)
              .filter(([key, value]) => !!value && key !== "sort")
              .map(([key, value]) => (
                <button key={key} onClick={() => set(key as keyof Filters, "")}>
                  {key === "saved" ? "Saved only" : `${key}: ${value}`}{" "}
                  <X size={12} />
                </button>
              ))}
          </div>
          {loading ? (
            <p role="status">Loading inventory…</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : results.length ? (
            <div className="vehicle-grid inventory-grid">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ArrowUpRight size={40} />
              <h2>A new direction awaits.</h2>
              <p>
                No vehicles match these selections. Try widening your search.
              </p>
              <button className="button outlined" onClick={() => reset()}>
                Clear all filters <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </section>
        <aside className="filters-sidebar">{filterPanel}</aside>
      </div>
      {sheet && (
        <Modal
          title={
            sheet === "make"
              ? "Choose your make"
              : sheet === "model"
                ? "Choose your model"
                : "Refine your search"
          }
          onClose={() => setSheet(undefined)}
        >
          {sheet === "make" ? (
            makePanel
          ) : sheet === "model" ? (
            <div className="model-pills">
              <button
                onClick={() => {
                  set("model", "");
                  setSheet(undefined);
                }}
              >
                All models
              </button>
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    set("model", m);
                    setSheet(undefined);
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <>
              {filterPanel}
              <button
                className="button dark"
                onClick={() => setSheet(undefined)}
              >
                Show {results.length} vehicles <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
