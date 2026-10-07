import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Camera, Check } from "lucide-react";
import { useDealer } from "../lib/store";
import { PageHeading } from "../components/Common";
import { submitLead } from "../lib/leads";
import { dealerConfig } from "../config/dealerConfig";
const steps = [
  "Your vehicle",
  "Vehicle details",
  "Condition",
  "Photos",
  "Your information",
  "Review / request value",
];
const slots = [
  "Front",
  "Rear",
  "Driver side",
  "Passenger side",
  "Interior",
  "Dash",
  "Odometer",
  "Damage",
];
export default function TradeIn() {
  const { trade, setTrade, payment, setPayment, selected } = useDealer();
  const [step, setStep] = useState(0),
    [photos, setPhotos] = useState<Record<string, string>>({}),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [requested, setRequested] = useState(false),
    [busy, setBusy] = useState(false),
    [submitError, setSubmitError] = useState(""),
    [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const photoRefs = useRef<Record<string, string>>({});
  const update = (key: keyof typeof trade, value: string | number) =>
    setTrade({ ...trade, [key]: value });
  useEffect(
    () => () => {
      Object.values(photoRefs.current).forEach(URL.revokeObjectURL);
    },
    [],
  );
  const photo = (slot: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, [slot]: "Choose an image up to 10 MB." });
      return;
    }
    if (photos[slot]) URL.revokeObjectURL(photos[slot]);
    photoRefs.current = { ...photos, [slot]: URL.createObjectURL(file) };
    setPhotos(photoRefs.current);
    setErrors({ ...errors, [slot]: "" });
  };
  return (
    <section className="section flow-page">
      <PageHeading
        eyebrow="LET YOUR NEXT CHAPTER BEGIN"
        title="Move up. Trade in."
        description="Your current drive can be the beginning of something new."
      />
      <p className="demo-notice">
        {dealerConfig.trade.demo
          ? "Demo appraisal request. "
          : "Appraisal request. "}
        No instant valuation. Photos are temporary local previews.
      </p>
      <ol className="step-progress">
        {steps.map((label, i) => (
          <li
            key={label}
            className={i === step ? "current" : i < step ? "complete" : ""}
          >
            <span>
              {i < step ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
            </span>
            <small>{label}</small>
          </li>
        ))}
      </ol>
      <form
        className="marble flow-panel trade-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (step < 5) {
            setStep(step + 1);
            return;
          }
          setBusy(true);
          setSubmitError("");
          try {
            await submitLead({
              type: "trade",
              ...contact,
              message: "Trade-in appraisal request",
              trade,
              payment,
              vehicle: selected
                ? {
                    id: selected.id,
                    stockNumber: selected.stockNumber,
                    vin: selected.vin,
                    price: selected.price,
                    year: selected.year,
                    make: selected.make,
                    model: selected.model,
                  }
                : undefined,
            });
            setPayment({ ...payment, trade: trade.estimatedValue });
            setRequested(true);
          } catch (error) {
            setSubmitError((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="step-content" key={step}>
          <span className="eyebrow">
            STEP {String(step + 1).padStart(2, "0")} OF 06
          </span>
          <h2>
            {step === 5 ? "YOUR TRADE-IN REQUEST IS READY." : `${steps[step]}.`}
          </h2>
          {step === 0 && (
            <>
              <p>
                Identify your vehicle by VIN, or enter the details below. No
                automatic VIN decoding is claimed.
              </p>
              <label>
                VIN (optional)
                <input
                  value={trade.vin}
                  minLength={17}
                  maxLength={17}
                  pattern="[A-HJ-NPR-Z0-9]{17}"
                  onChange={(e) => update("vin", e.target.value.toUpperCase())}
                  placeholder="17-character VIN"
                />
              </label>
              <div className="or-divider">OR ENTER YOUR VEHICLE</div>
              <div className="field-pair">
                <label>
                  Year
                  <input
                    required={!trade.vin}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={trade.year}
                    onChange={(e) => update("year", e.target.value)}
                    placeholder="2019"
                  />
                </label>
                <label>
                  Make
                  <input
                    required={!trade.vin}
                    value={trade.make}
                    onChange={(e) => update("make", e.target.value)}
                    placeholder="Honda"
                  />
                </label>
              </div>
              <div className="field-pair">
                <label>
                  Model
                  <input
                    required={!trade.vin}
                    value={trade.model}
                    onChange={(e) => update("model", e.target.value)}
                    placeholder="Accord"
                  />
                </label>
                <label>
                  Trim
                  <input
                    value={trade.trim}
                    onChange={(e) => update("trim", e.target.value)}
                    placeholder="Sport"
                  />
                </label>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="field-pair">
                <label>
                  Mileage
                  <input
                    required
                    type="number"
                    min="0"
                    max="2000000"
                    value={trade.mileage}
                    onChange={(e) => update("mileage", e.target.value)}
                  />
                </label>
                <label>
                  Loan / payoff status
                  <input
                    value={trade.payoff}
                    onChange={(e) => update("payoff", e.target.value)}
                    placeholder="Paid off, or estimated payoff"
                  />
                </label>
              </div>
              <label>
                Title status
                <select
                  value={trade.title}
                  onChange={(e) => update("title", e.target.value)}
                >
                  {["Clean", "Salvage", "Rebuilt", "Unknown"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Any accident history?
                <select
                  value={trade.accidents}
                  onChange={(e) => update("accidents", e.target.value)}
                >
                  {["Unknown", "None", "Yes"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Your own trade estimate (optional, $)
                <input
                  type="number"
                  min="0"
                  value={trade.estimatedValue}
                  onChange={(e) =>
                    update("estimatedValue", Math.max(0, +e.target.value))
                  }
                />
              </label>
              <p className="notice">
                This is your estimate, not a dealership valuation. It can carry
                into your payment calculation.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <p>Give us a clear picture of your current vehicle.</p>
              <div className="condition-options">
                {["Excellent", "Good", "Fair", "Needs work"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-pressed={trade.condition === c}
                    className={trade.condition === c ? "selected" : ""}
                    onClick={() => update("condition", c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {(
                [
                  ["modifications", "Modifications"],
                  ["warningLights", "Warning lights"],
                  ["damage", "Major damage"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={trade[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder="None, or describe here"
                  />
                </label>
              ))}
            </>
          )}
          {step === 3 && (
            <>
              <p>
                Photos are optional for this demo. Preview each angle locally;
                files are never uploaded or retained.
              </p>
              <div className="photo-upload-grid">
                {slots.map((slot) => (
                  <label key={slot} className="photo-slot">
                    {photos[slot] ? (
                      <img src={photos[slot]} alt={`Your trade, ${slot}`} />
                    ) : (
                      <Camera size={25} />
                    )}
                    <span>{slot}</span>
                    <input
                      type="file"
                      accept="image/*"
                      aria-label={`Upload ${slot} photo`}
                      onChange={(e) => photo(slot, e.target.files?.[0])}
                    />
                    {errors[slot] && <small role="alert">{errors[slot]}</small>}
                  </label>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p>
                {dealerConfig.trade.demo
                  ? "Use fictional details for this demonstration."
                  : "How should the dealership reach you?"}
              </p>
              <label>
                {dealerConfig.trade.demo ? "Sample name" : "Name"}
                <input
                  required
                  value={contact.name}
                  onChange={(e) =>
                    setContact({ ...contact, name: e.target.value })
                  }
                />
              </label>
              <div className="field-pair">
                <label>
                  {dealerConfig.trade.demo ? "Sample email" : "Email"}
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                  />
                </label>
                <label>
                  {dealerConfig.trade.demo ? "Sample phone" : "Phone"}
                  <input
                    type="tel"
                    required
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                  />
                </label>
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <p>
                This is an appraisal request, not an instant valuation or
                guaranteed offer.
              </p>
              <dl className="review-summary">
                {[
                  [
                    "Vehicle",
                    `${trade.year} ${trade.make} ${trade.model} ${trade.trim}`.trim() ||
                      trade.vin,
                  ],
                  ["VIN", trade.vin || "Not supplied"],
                  [
                    "Mileage",
                    `${Number(trade.mileage).toLocaleString()} miles`,
                  ],
                  ["Condition", trade.condition],
                  ["Title / history", `${trade.title} / ${trade.accidents}`],
                  ["Loan / payoff", trade.payoff || "Not supplied"],
                  ["Modifications", trade.modifications || "None supplied"],
                  ["Warning lights", trade.warningLights || "None supplied"],
                  ["Damage", trade.damage || "None supplied"],
                  [
                    "Photo previews",
                    `${Object.keys(photos).length} (local only)`,
                  ],
                  ["Contact", `${contact.name} · ${contact.email}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <label className="check-label">
                <input required type="checkbox" />{" "}
                {dealerConfig.trade.demo
                  ? "I understand this is a demo request using fictional data."
                  : "I consent to being contacted about my appraisal request."}
              </label>
            </>
          )}
        </div>
        {submitError && <p role="alert">{submitError}</p>}
        <div className="flow-actions">
          {step > 0 ? (
            <button
              type="button"
              className="text-link"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <Link to="/inventory" className="text-link">
              <ArrowLeft size={16} /> Inventory
            </Link>
          )}
          <button
            type="submit"
            className="button dark"
            disabled={busy || requested}
          >
            {busy
              ? "Processing…"
              : step === 5
                ? "Request trade value"
                : "Continue"}{" "}
            <ArrowUpRight size={16} />
          </button>
        </div>
        {requested && (
          <div className="success" role="status">
            <Check size={28} />
            <h3>
              {dealerConfig.leads.mode === "demo"
                ? "Demo appraisal request complete."
                : "Appraisal request received."}
            </h3>
            <p>
              {dealerConfig.leads.mode === "demo"
                ? "Nothing was sent to a dealer. "
                : "The dealer can now follow up. "}
              Your trade estimate now carries into your payment plan.
            </p>
            <Link
              className="button dark"
              to={
                selected ? `/inventory/${selected.slug}#payment` : "/financing"
              }
            >
              Continue your journey <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </form>
    </section>
  );
}
