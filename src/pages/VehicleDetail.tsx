import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { useDealer } from "../lib/store";
import { money } from "../lib/inventory";
import type { LeadType } from "../lib/types";
import { Modal, SaveButton } from "../components/Common";
import { LeadForm } from "../components/LeadForm";
import { Gallery } from "../components/Gallery";
import { PaymentCalculator } from "../components/PaymentCalculator";
import { VehicleCard } from "../components/VehicleCard";
import { dealerConfig } from "../config/dealerConfig";
export default function VehicleDetail() {
  const { slug } = useParams();
  const { vehicles, select, loading } = useDealer();
  const [lead, setLead] = useState<LeadType>();
  const vehicle = vehicles.find((v) => v.slug === slug);
  if (loading) return <div className="section">Loading vehicle…</div>;
  if (!vehicle)
    return (
      <div className="empty-state">
        <h1>Vehicle not found.</h1>
        <Link to="/inventory" className="button gold">
          Back to inventory
        </Link>
      </div>
    );
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return (
    <div className="detail-page section">
      <div className="detail-breadcrumb">
        <Link to="/inventory">
          <ArrowLeft size={15} /> Back to inventory
        </Link>
        <span>
          {vehicle.stockNumber}{" "}
          {vehicle.demo
            ? "· DEMO VEHICLE"
            : vehicle.status === "pending"
              ? "· SALE PENDING"
              : ""}
        </span>
      </div>
      <Gallery
        key={vehicle.id}
        images={vehicle.images}
        title={title}
        demo={vehicle.demo}
      />
      <div className="vehicle-detail-panel marble">
        <div className="detail-title">
          <div>
            <span className="eyebrow">
              {vehicle.year} · {vehicle.bodyStyle}
            </span>
            <h1>
              {vehicle.make} {vehicle.model}
            </h1>
            <p>
              {vehicle.trim} · {vehicle.exteriorColor}
            </p>
          </div>
          <div>
            <strong>{money(vehicle.price)}</strong>
            <span>{vehicle.demo ? "Sample asking price" : "Asking price"}</span>
          </div>
          <SaveButton vehicle={vehicle} />
        </div>
        <dl className="vehicle-spec-grid">
          {[
            ["Mileage", `${vehicle.mileage.toLocaleString()} mi`],
            ["Drivetrain", vehicle.drivetrain],
            ["Transmission", vehicle.transmission],
            ["Engine", vehicle.engine],
            ["Fuel type", vehicle.fuelType],
            ["Interior", vehicle.interiorColor],
            ["Stock number", vehicle.stockNumber],
            ["VIN", vehicle.vin || "Not supplied"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "Not supplied"}</dd>
            </div>
          ))}
        </dl>
        <div className="detail-actions">
          <button className="button dark" onClick={() => setLead("quote")}>
            Get a quote <ArrowUpRight size={16} />
          </button>
          <button
            className="button light-outline"
            onClick={() => setLead("availability")}
          >
            Confirm availability <ArrowUpRight size={16} />
          </button>
          <Link
            className="button light-outline"
            to="/financing"
            onClick={() => select(vehicle)}
          >
            Get approved <ArrowUpRight size={16} />
          </Link>
          <Link
            className="button light-outline"
            to="/trade-in"
            onClick={() => select(vehicle)}
          >
            Value your trade <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="overview-section">
        <div>
          <span className="eyebrow">THE DETAILS THAT MATTER</span>
          <h2>Vehicle overview.</h2>
          <p>{vehicle.description}</p>
          <h3>Vehicle history</h3>
          {vehicle.vehicleHistoryURL ? (
            <a
              className="text-link"
              href={vehicle.vehicleHistoryURL}
              target="_blank"
              rel="noreferrer"
            >
              View history report <ArrowUpRight size={16} />
            </a>
          ) : (
            <p className="notice">
              No verified history report is available for this vehicle. Confirm
              history with the dealer before purchase.
            </p>
          )}
        </div>
        <div>
          <h3>Selected features</h3>
          <ul className="feature-list">
            {vehicle.features.map((f) => (
              <li key={f}>
                <Check size={15} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div id="payment">
        <PaymentCalculator vehicle={vehicle} />
      </div>
      <section className="similar">
        <div className="section-top">
          <div>
            <span className="eyebrow">MORE TO EXPLORE</span>
            <h2>A few other possibilities.</h2>
          </div>
          <Link className="text-link" to="/inventory">
            All inventory <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="vehicle-grid featured-grid">
          {[
            ...vehicles.filter(
              (v) =>
                v.status !== "sold" &&
                v.id !== vehicle.id &&
                v.bodyStyle === vehicle.bodyStyle,
            ),
            ...vehicles.filter(
              (v) =>
                v.status !== "sold" &&
                v.id !== vehicle.id &&
                v.bodyStyle !== vehicle.bodyStyle,
            ),
          ]
            .slice(0, 3)
            .map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
        </div>
      </section>
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
      {dealerConfig.demoMode && (
        <p className="notice">{dealerConfig.legal.demo}</p>
      )}
    </div>
  );
}
