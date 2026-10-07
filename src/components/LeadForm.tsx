import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { dealerConfig } from "../config/dealerConfig";
import { submitLead } from "../lib/leads";
import { useDealer } from "../lib/store";
import type { LeadType, Vehicle } from "../lib/types";
import { money } from "../lib/inventory";
export function LeadForm({
  type = "contact",
  vehicle,
  onDone,
}: {
  type?: LeadType;
  vehicle?: Vehicle;
  onDone?: () => void;
}) {
  const [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [demo, setDemo] = useState(true);
  const { payment, trade } = useDealer();
  if (done)
    return (
      <div className="success">
        <Check size={36} />
        <h3>{demo ? "Demo request complete" : "Request received"}</h3>
        <p>
          {demo
            ? "Your sample request was simulated. Nothing was sent or permanently stored."
            : "Thank you. The dealership will follow up with you."}
        </p>
        {onDone && (
          <button className="button dark" onClick={onDone}>
            Continue exploring <ArrowUpRight size={16} />
          </button>
        )}
      </div>
    );
  return (
    <form
      className="lead-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          const result = await submitLead({
            type,
            name: String(f.get("name")),
            email: String(f.get("email")),
            phone: String(f.get("phone")),
            message: String(f.get("message") || ""),
            vehicle: vehicle
              ? {
                  id: vehicle.id,
                  stockNumber: vehicle.stockNumber,
                  vin: vehicle.vin,
                  price: vehicle.price,
                  year: vehicle.year,
                  make: vehicle.make,
                  model: vehicle.model,
                }
              : undefined,
            payment,
            trade: type === "trade" ? trade : undefined,
          });
          setDemo(result.demo);
          setDone(true);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {vehicle && (
        <div className="lead-context">
          <b>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </b>
          <span>
            {vehicle.stockNumber} · {money(vehicle.price)}{" "}
            {vehicle.vin && `· VIN ${vehicle.vin}`}
          </span>
        </div>
      )}
      <p className="notice">
        {dealerConfig.leads.mode === "demo"
          ? dealerConfig.legal.privacy
          : "Your request will be sent securely to the configured dealership endpoint."}
      </p>
      <label>
        Name
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={100}
          placeholder="Sample name"
        />
      </label>
      <div className="field-pair">
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={30}
            placeholder="Your phone number"
          />
        </label>
      </div>
      <label>
        Message
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          defaultValue={
            type === "availability"
              ? "I would like to confirm availability of this vehicle."
              : type === "quote"
                ? "I would like a quote for this vehicle."
                : ""
          }
        />
      </label>
      <label className="check-label">
        <input type="checkbox" required />{" "}
        {dealerConfig.leads.mode === "demo"
          ? "I understand this is a demo and I am using fictional information."
          : "I consent to being contacted about this request."}
      </label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="button dark" type="submit">
        {busy
          ? "Submitting…"
          : dealerConfig.leads.mode === "demo"
            ? "Simulate request"
            : "Send request"}{" "}
        <ArrowUpRight size={17} />
      </button>
    </form>
  );
}
