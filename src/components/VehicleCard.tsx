import { useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import type { Vehicle, LeadType } from "../lib/types";
import { money } from "../lib/inventory";
import { useDealer } from "../lib/store";
import { dealerConfig } from "../config/dealerConfig";
import { financingURL } from "../lib/financing";
import { Modal, Photo, SaveButton } from "./Common";
import { LeadForm } from "./LeadForm";
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [tray, setTray] = useState(false),
    [lead, setLead] = useState<LeadType>();
  const navigate = useNavigate();
  const { select, payment } = useDealer();
  const openDetails = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const action = () =>
      flushSync(() => navigate(`/inventory/${vehicle.slug}`));
    const el = document.querySelector(
      `[data-photo="${vehicle.id}"] img`,
    ) as HTMLElement;
    if (el) el.style.viewTransitionName = "vehicle-photo";
    if (
      "startViewTransition" in document &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      (
        document as unknown as {
          startViewTransition: (cb: () => void) => { finished: Promise<void> };
        }
      )
        .startViewTransition(action)
        .finished.catch(() => {})
        .finally(() => {
          if (el) el.style.viewTransitionName = "";
        });
    } else action();
  };
  return (
    <article className="vehicle-card">
      <div className="card-photo">
        <Link
          data-photo={vehicle.id}
          to={`/inventory/${vehicle.slug}`}
          onClick={openDetails}
          aria-label={`View ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        >
          <Photo
            src={vehicle.images[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.demo ? " — illustrative demo photography" : ""}`}
            style={{}}
          />
        </Link>
        <span className="photo-label">
          {vehicle.featured
            ? "THE SELECT COLLECTION"
            : vehicle.demo
              ? "DEMO INVENTORY"
              : "THE COLLECTION"}
        </span>
        <SaveButton vehicle={vehicle} />
        <span className="image-count">
          01 / {String(Math.max(1, vehicle.images.length)).padStart(2, "0")}
        </span>
      </div>
      <div className="card-info marble">
        <div className="card-year">
          {vehicle.year} <span>{vehicle.bodyStyle}</span>
        </div>
        <Link to={`/inventory/${vehicle.slug}`} className="card-title">
          {vehicle.make} {vehicle.model} <ArrowUpRight size={18} />
        </Link>
        <p className="card-trim">{vehicle.trim}</p>
        <div className="card-specs">
          <span>{vehicle.mileage.toLocaleString()} MI</span>
          <span>{vehicle.drivetrain}</span>
          <span>{vehicle.transmission}</span>
        </div>
        <div className="card-bottom">
          <strong>{money(vehicle.price)}</strong>
          <button
            aria-expanded={tray}
            className="quick-action"
            onClick={() => setTray(!tray)}
          >
            Quick actions <ArrowUp size={14} />
          </button>
        </div>
        {tray && !window.matchMedia("(max-width: 600px)").matches && (
          <div className="quick-tray">
            <button
              onClick={() => {
                setTray(false);
                setLead("quote");
              }}
            >
              Get a quote <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => {
                setTray(false);
                setLead("availability");
              }}
            >
              Confirm availability <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => {
                select(vehicle);
                if (
                  dealerConfig.financing.mode === "external" &&
                  dealerConfig.financing.providerURL
                )
                  window.location.assign(financingURL(vehicle, payment));
                else navigate("/financing");
              }}
            >
              Apply online <ArrowUpRight size={16} />
            </button>
            <Link to={`/inventory/${vehicle.slug}`}>
              View details <ArrowUpRight size={16} />
            </Link>
            <button onClick={() => setTray(false)}>Close actions</button>
          </div>
        )}
      </div>
      {tray && window.matchMedia("(max-width: 600px)").matches && (
        <Modal title="Quick actions" onClose={() => setTray(false)}>
          <div className="mobile-quick-actions">
            <p>
              {vehicle.year} {vehicle.make} {vehicle.model} ·{" "}
              {vehicle.stockNumber}
            </p>
            <button
              className="button dark"
              onClick={() => {
                setTray(false);
                setLead("quote");
              }}
            >
              Get a quote <ArrowUpRight size={16} />
            </button>
            <button
              className="button light-outline"
              onClick={() => {
                setTray(false);
                setLead("availability");
              }}
            >
              Confirm availability <ArrowUpRight size={16} />
            </button>
            <Link
              className="button light-outline"
              to="/financing"
              onClick={() => {
                select(vehicle);
                setTray(false);
              }}
            >
              Apply online <ArrowUpRight size={16} />
            </Link>
            <Link
              className="button light-outline"
              to={`/inventory/${vehicle.slug}`}
              onClick={() => setTray(false)}
            >
              View details <ArrowUpRight size={16} />
            </Link>
          </div>
        </Modal>
      )}
      {lead && (
        <Modal
          title={lead === "quote" ? "Get a quote" : "Confirm availability"}
          onClose={() => setLead(undefined)}
        >
          <LeadForm
            type={lead}
            vehicle={vehicle}
            onDone={() => setLead(undefined)}
          />
        </Modal>
      )}
    </article>
  );
}
