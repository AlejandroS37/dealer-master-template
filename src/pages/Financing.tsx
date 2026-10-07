import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import { dealerConfig as d } from "../config/dealerConfig";
import { useDealer } from "../lib/store";
import { calculatePayment, money } from "../lib/inventory";
import { submitLead } from "../lib/leads";
import { PageHeading, Photo } from "../components/Common";
import { PaymentCalculator } from "../components/PaymentCalculator";
import { financingURL } from "../lib/financing";
const steps = [
  "Your vehicle",
  "Your payment",
  "About you",
  "Employment / income",
  "Review & submit",
];
export default function Financing() {
  const { vehicles, selected, select, payment } = useDealer();
  const [step, setStep] = useState(0),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [applicant, setApplicant] = useState({
    name: "",
    email: "",
    phone: "",
    employment: "",
    income: "",
    consent: false,
  });
  const vehicle = selected || vehicles[0];
  if (d.financing.mode === "external")
    return (
      <section className="section flow-page">
        <PageHeading
          eyebrow="YOUR ROAD FORWARD"
          title="Financing, on your terms."
        />
        <div className="marble flow-panel">
          <LockKeyhole />
          <h2>Apply with our financing partner.</h2>
          <p>
            Your credit application is handled by the dealer’s secure provider.
          </p>
          {d.financing.providerURL ? (
            <a className="button dark" href={financingURL(vehicle, payment)}>
              Continue to provider <ArrowUpRight size={16} />
            </a>
          ) : (
            <p role="alert">
              A financing provider URL has not been configured. Contact the
              dealer before applying.
            </p>
          )}
          {vehicle && (
            <Link
              to={`/inventory/${vehicle.slug}#payment`}
              className="text-link"
            >
              Not ready to apply? Estimate your payment
            </Link>
          )}
        </div>
      </section>
    );
  if (!vehicle)
    return (
      <section className="section flow-page">
        <PageHeading eyebrow="FINANCING" title="Choose your drive first." />
        <Link to="/inventory" className="button gold">
          Browse inventory
        </Link>
      </section>
    );
  const update = (key: keyof typeof applicant, value: string | boolean) =>
    setApplicant({ ...applicant, [key]: value });
  return (
    <section className="section flow-page">
      <PageHeading
        eyebrow="THE NEXT CHAPTER STARTS HERE"
        title="Make it yours."
        description="A considered path from your next vehicle to your next move."
      />
      <p className="demo-notice">
        <LockKeyhole size={15} /> Demo application. Use fictional details. No
        credit check or lender submission.
      </p>
      {done ? (
        <div className="marble flow-panel success">
          <Check size={38} />
          <h2>Your demo application is complete.</h2>
          <p>
            No information was sent to a lender or stored permanently. This is a
            demonstration, not a credit decision.
          </p>
          <Link className="button dark" to="/inventory">
            Explore the collection <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <ol className="step-progress">
            {steps.map((s, i) => (
              <li
                className={i === step ? "current" : i < step ? "complete" : ""}
                key={s}
              >
                <span>
                  {i < step ? (
                    <Check size={14} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <small>{s}</small>
              </li>
            ))}
          </ol>
          <div className="flow-layout">
            <aside className="flow-context">
              <Photo
                src={vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model} sample photography`}
              />
              <span className="eyebrow">YOUR SELECTED VEHICLE</span>
              <h3>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p>{vehicle.trim}</p>
              <strong>{money(vehicle.price)}</strong>
              <small>{vehicle.stockNumber} · Sample inventory</small>
              <dl>
                <div>
                  <dt>Down payment</dt>
                  <dd>{money(Math.min(vehicle.price, payment.down))}</dd>
                </div>
                <div>
                  <dt>Term / APR</dt>
                  <dd>
                    {payment.term} mo / {payment.apr}%
                  </dd>
                </div>
                <div>
                  <dt>Trade estimate</dt>
                  <dd>{money(payment.trade)}</dd>
                </div>
                <div>
                  <dt>Est. monthly</dt>
                  <dd>
                    {money(
                      calculatePayment(vehicle.price, {
                        ...payment,
                        down: Math.min(vehicle.price, payment.down),
                      }).monthly,
                    )}
                  </dd>
                </div>
              </dl>
              <Link
                className="text-link"
                to={`/inventory/${vehicle.slug}#payment`}
              >
                Not ready? Estimate your payment <ArrowUpRight size={14} />
              </Link>
            </aside>
            <form
              className="flow-panel marble"
              onSubmit={async (e) => {
                e.preventDefault();
                if (step < 4) {
                  setStep(step + 1);
                  return;
                }
                setBusy(true);
                setError("");
                try {
                  await submitLead({
                    type: "financing",
                    name: applicant.name,
                    email: applicant.email,
                    phone: applicant.phone,
                    message:
                      "Demo financing journey completed; no credit application collected.",
                    vehicle: {
                      id: vehicle.id,
                      stockNumber: vehicle.stockNumber,
                      vin: vehicle.vin,
                      price: vehicle.price,
                      year: vehicle.year,
                      make: vehicle.make,
                      model: vehicle.model,
                    },
                    payment,
                  });
                  setDone(true);
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div key={step} className="step-content">
                <span className="eyebrow">
                  STEP {String(step + 1).padStart(2, "0")} OF 05
                </span>
                <h2>{steps[step]}.</h2>
                {step === 0 && (
                  <>
                    <p>Start with the vehicle that speaks to you.</p>
                    <label>
                      Select a vehicle
                      <select
                        value={vehicle.id}
                        onChange={(e) => {
                          const v = vehicles.find(
                            (v) => v.id === e.target.value,
                          );
                          if (v) select(v);
                        }}
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.year} {v.make} {v.model} — {money(v.price)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="notice">
                      The vehicle you selected in inventory follows you here
                      automatically.
                    </p>
                  </>
                )}
                {step === 1 && <PaymentCalculator compact vehicle={vehicle} />}
                {step === 2 && (
                  <>
                    <p>
                      Fictional contact information only. No SSN, date of birth
                      or credit data.
                    </p>
                    <label>
                      Sample full name
                      <input
                        required
                        value={applicant.name}
                        onChange={(e) => update("name", e.target.value)}
                        maxLength={100}
                      />
                    </label>
                    <div className="field-pair">
                      <label>
                        Sample email
                        <input
                          required
                          type="email"
                          value={applicant.email}
                          onChange={(e) => update("email", e.target.value)}
                        />
                      </label>
                      <label>
                        Sample phone
                        <input
                          required
                          type="tel"
                          value={applicant.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          maxLength={30}
                        />
                      </label>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <p>
                      These fields demonstrate a future secure provider flow.
                      Enter fictional values only; they are not submitted.
                    </p>
                    <label>
                      Sample employment status
                      <select
                        required
                        value={applicant.employment}
                        onChange={(e) => update("employment", e.target.value)}
                      >
                        <option value="">Choose status</option>
                        {["Employed", "Self-employed", "Retired", "Other"].map(
                          (v) => (
                            <option key={v}>{v}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Fictional monthly income ($)
                      <input
                        required
                        type="number"
                        min="0"
                        max="1000000"
                        value={applicant.income}
                        onChange={(e) => update("income", e.target.value)}
                      />
                    </label>
                  </>
                )}
                {step === 4 && (
                  <>
                    <p>
                      Review your demo journey. No application will be sent to a
                      lender.
                    </p>
                    <dl className="review-summary">
                      <div>
                        <dt>Applicant</dt>
                        <dd>{applicant.name}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{applicant.email}</dd>
                      </div>
                      <div>
                        <dt>Employment (fictional)</dt>
                        <dd>{applicant.employment}</dd>
                      </div>
                      <div>
                        <dt>Monthly income (fictional)</dt>
                        <dd>{money(+applicant.income)}</dd>
                      </div>
                      <div>
                        <dt>Vehicle</dt>
                        <dd>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </dd>
                      </div>
                      <div>
                        <dt>Estimated payment</dt>
                        <dd>
                          {money(
                            calculatePayment(vehicle.price, {
                              ...payment,
                              down: Math.min(vehicle.price, payment.down),
                            }).monthly,
                          )}{" "}
                          / mo
                        </dd>
                      </div>
                    </dl>
                    <p className="notice">{d.legal.payment}</p>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        required
                        checked={applicant.consent}
                        onChange={(e) => update("consent", e.target.checked)}
                      />{" "}
                      I understand this is a simulated application using
                      fictional information.
                    </label>
                  </>
                )}
              </div>
              {error && <p role="alert">{error}</p>}
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
                  <Link className="text-link" to="/inventory">
                    <ArrowLeft size={16} /> Inventory
                  </Link>
                )}
                <button className="button dark" type="submit" disabled={busy}>
                  {busy
                    ? "Processing…"
                    : step === 4
                      ? "Complete demo application"
                      : "Continue"}{" "}
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
