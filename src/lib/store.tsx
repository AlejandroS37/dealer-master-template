import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dealerConfig } from "../config/dealerConfig";
import { demoInventoryAdapter } from "../data/inventory";
import type {
  InventoryAdapter,
  PaymentPlan,
  TradeDraft,
  Vehicle,
} from "./types";
export const initialTrade: TradeDraft = {
  vin: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  mileage: "",
  condition: "Good",
  accidents: "Unknown",
  title: "Clean",
  payoff: "",
  modifications: "",
  warningLights: "",
  damage: "",
  estimatedValue: 0,
};
const initialPayment: PaymentPlan = {
  down: 0,
  term: dealerConfig.financing.defaultTerm,
  apr: dealerConfig.financing.defaultAPR,
  trade: 0,
  fees: 0,
};
interface Store {
  vehicles: Vehicle[];
  loading: boolean;
  error: string;
  saved: string[];
  toggleSaved: (id: string) => void;
  selected?: Vehicle;
  select: (vehicle: Vehicle) => void;
  payment: PaymentPlan;
  setPayment: (plan: PaymentPlan) => void;
  trade: TradeDraft;
  setTrade: (trade: TradeDraft) => void;
}
const Context = createContext<Store | null>(null);
export function DealerProvider({
  children,
  adapter = demoInventoryAdapter,
}: {
  children: ReactNode;
  adapter?: InventoryAdapter;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [selected, select] = useState<Vehicle>();
  const [payment, setPayment] = useState(initialPayment),
    [trade, setTrade] = useState(initialTrade);
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem(`dealer-favorites:${dealerConfig.id}`) || "[]",
      );
      return Array.isArray(data)
        ? data.filter((v) => typeof v === "string")
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    let active = true;
    adapter
      .list()
      .then((data) => {
        if (active) setVehicles(data);
      })
      .catch(() => {
        if (active)
          setError("Inventory could not be loaded. Please try again later.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [adapter]);
  const toggleSaved = (id: string) =>
    setSaved((current) => {
      const next = current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id];
      try {
        localStorage.setItem(
          `dealer-favorites:${dealerConfig.id}`,
          JSON.stringify(next),
        );
      } catch {
        /* Storage can be unavailable in private browsing. */
      }
      return next;
    });
  return (
    <Context.Provider
      value={{
        vehicles,
        loading,
        error,
        saved,
        toggleSaved,
        selected,
        select,
        payment,
        setPayment,
        trade,
        setTrade,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDealer() {
  const value = useContext(Context);
  if (!value) throw Error("DealerProvider missing");
  return value;
}
