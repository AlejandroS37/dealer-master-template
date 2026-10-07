import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  MapPin,
  Phone,
  Clock,
  Mail,
  RefreshCw,
} from "lucide-react";
import { dealerConfig as d } from "../config/dealerConfig";
import { mapLocation } from "../lib/location";
export function DealerLocation() {
  const location = mapLocation();
  const [failed, setFailed] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 7000);
    // A no-cors connectivity probe catches blocked/offline embeds, which do not reliably emit iframe errors.
    // It reads no provider response, cookies, or user information.
    fetch(location.embedURL, {
      mode: "no-cors",
      credentials: "omit",
      signal: controller.signal,
    })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [location.embedURL, attempt]);
  return (
    <section className="dealer-location marble" aria-label={`Visit ${d.name}`}>
      <div className="dealer-map">
        <div className="map-label">
          <MapPin size={15} />
          <span>
            {location.verified
              ? "YOUR NEXT DESTINATION"
              : "BUSINESS LOCATION SEARCH"}
          </span>
        </div>
        {failed ? (
          <div className="map-fallback">
            <MapPin size={35} />
            <h3>Explore the location in Maps.</h3>
            <p>
              The embedded map could not load. Directions and the external map
              are still available.
            </p>
            <button
              className="text-link"
              onClick={() => {
                setAttempt(attempt + 1);
                setFailed(false);
              }}
            >
              Retry map <RefreshCw size={15} />
            </button>
          </div>
        ) : (
          <iframe
            key={attempt}
            title={`Interactive map for ${d.name}`}
            src={location.embedURL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={() => setFailed(true)}
            allowFullScreen
          />
        )}
        <a
          className="map-external"
          href={location.externalURL}
          target="_blank"
          rel="noreferrer"
        >
          Open larger map <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="location-information">
        <span className="eyebrow">VISIT. CALL. CONNECT.</span>
        <h2>{d.name}</h2>
        <div className="location-address">
          <MapPin size={20} />
          <div>
            <p>{d.contact.address}</p>
            <p>
              {[d.contact.city, d.contact.state, d.contact.zip]
                .filter(Boolean)
                .join(" ")}
            </p>
          </div>
        </div>
        <div className="location-hours">
          <Clock size={20} />
          <div>
            <span className="location-caption">SHOWROOM HOURS</span>
            {d.contact.hours.map((hour) => (
              <p key={hour}>{hour}</p>
            ))}
          </div>
        </div>
        {d.contact.phone ? (
          <a className="location-phone" href={`tel:${d.contact.phone}`}>
            <Phone size={20} />
            {d.contact.phone}
          </a>
        ) : (
          <p className="notice">Public phone awaiting dealer verification.</p>
        )}
        {d.contact.email && (
          <a className="location-phone" href={`mailto:${d.contact.email}`}>
            <Mail size={18} />
            {d.contact.email}
          </a>
        )}
        <div className="location-actions">
          <a
            className="button dark"
            href={location.directionsURL}
            target="_blank"
            rel="noreferrer"
          >
            Get directions <ArrowUpRight size={16} />
          </a>
          {d.contact.phone && (
            <a className="button light-outline" href={`tel:${d.contact.phone}`}>
              Call dealer <Phone size={16} />
            </a>
          )}
          {d.contact.sms && (
            <a className="text-link" href={`sms:${d.contact.sms}`}>
              Text dealer <ArrowUpRight size={15} />
            </a>
          )}
        </div>
        {!location.verified && (
          <p className="location-disclaimer">
            This map uses a business-name search. The dealership address has not
            yet been verified; confirm the destination in Maps before visiting.
          </p>
        )}
      </div>
    </section>
  );
}
