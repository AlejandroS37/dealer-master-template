import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { useDealer } from "../lib/store";
import { calculatePayment, money } from "../lib/inventory";
import { dealerConfig } from "../config/dealerConfig";
import type { Vehicle } from "../lib/types";
export function PaymentCalculator({
  vehicle,
  compact = false,
}: {
  vehicle: Vehicle;
  compact?: boolean;
}) {
  const { payment, setPayment, select, trade } = useDealer();
  const plan = { ...payment, down: Math.min(vehicle.price, payment.down) };
  const { principal, monthly } = calculatePayment(vehicle.price, plan);
  const update = (key: keyof typeof plan, value: number) =>
    setPayment({
      ...plan,
      [key]: Number.isFinite(value)
        ? Math.max(
            0,
            key === "down"
              ? Math.min(vehicle.price, value)
              : key === "apr"
                ? Math.min(50, value)
                : value,
          )
        : 0,
    });
  return (
    <div className={`payment-panel marble ${compact ? "compact" : ""}`}>
      <div className="payment-header">
        <div>
          <span className="eyebrow">YOUR DRIVE. YOUR TERMS.</span>
          <h2>BUILD YOUR PAYMENT.</h2>
        </div>
        <div className="payment-amount" aria-live="polite">
          <small>ESTIMATED PAYMENT</small>
          <strong key={Math.round(monthly)}>
            {money(monthly)}
            <span> / MO</span>
          </strong>
        </div>
      </div>
      <div className="payment-layout">
        <div>
          <div className="slider-label">
            <label htmlFor="down-range">Down payment</label>
            <label className="dollar-input">
              <span>$</span>
              <input
                aria-label="Down payment dollars"
                type="number"
                min="0"
                max={vehicle.price}
                value={plan.down}
                onChange={(e) => update("down", e.target.valueAsNumber)}
              />
            </label>
          </div>
          <input
            id="down-range"
            className="payment-range"
            type="range"
            min="0"
            max={vehicle.price}
            step="1"
            value={plan.down}
            onChange={(e) => update("down", e.target.valueAsNumber)}
          />
          <div className="range-ends">
            <span>$0</span>
            <span>{money(vehicle.price)}</span>
          </div>
          <div className="presets">
            {[0, 10, 20, 30].map((percent) => (
              <button
                type="button"
                key={percent}
                className={
                  plan.down === Math.round((vehicle.price * percent) / 100)
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  update("down", Math.round((vehicle.price * percent) / 100))
                }
              >
                {percent === 0 ? "$0" : `${percent}%`}
              </button>
            ))}
          </div>
          <label>
            Term <span className="muted">(months)</span>
          </label>
          <div className="term-options">
            {[36, 48, 60, 72, 84].map((term) => (
              <button
                type="button"
                key={term}
                aria-pressed={plan.term === term}
                className={plan.term === term ? "selected" : ""}
                onClick={() => update("term", term)}
              >
                {term}
              </button>
            ))}
          </div>
          <div className="field-pair">
            <label>
              Estimated APR (%)
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={plan.apr}
                onChange={(e) => update("apr", e.target.valueAsNumber)}
              />
            </label>
            <label>
              Estimated taxes & fees ($)
              <input
                type="number"
                min="0"
                value={plan.fees}
                onChange={(e) => update("fees", e.target.valueAsNumber)}
              />
            </label>
          </div>
        </div>
        <div className="payment-summary">
          <label>
            <Plus size={14} /> Add your trade estimate ($)
            <input
              type="number"
              min="0"
              value={plan.trade}
              onChange={(e) => update("trade", e.target.valueAsNumber)}
            />
          </label>
          {trade.make && (
            <p>
              Trade: {trade.year} {trade.make} {trade.model}
            </p>
          )}
          <dl>
            <div>
              <dt>Vehicle price</dt>
              <dd>{money(vehicle.price)}</dd>
            </div>
            <div>
              <dt>Down payment</dt>
              <dd>− {money(plan.down)}</dd>
            </div>
            <div>
              <dt>Trade estimate</dt>
              <dd>− {money(plan.trade)}</dd>
            </div>
            <div>
              <dt>Estimated fees</dt>
              <dd>+ {money(plan.fees)}</dd>
            </div>
            <div className="total">
              <dt>Amount financed</dt>
              <dd>{money(principal)}</dd>
            </div>
          </dl>
          <Link
            className="button dark"
            to="/financing"
            onClick={() => {
              select(vehicle);
              setPayment(plan);
            }}
          >
            Get pre-approved <ArrowUpRight size={16} />
          </Link>
          <Link
            className="text-link"
            to="/trade-in"
            onClick={() => select(vehicle)}
          >
            Value your trade <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <p className="notice">{dealerConfig.legal.payment}</p>
    </div>
  );
}
