import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Phone, Clock, Mail } from "lucide-react";
import { dealerConfig as d } from "../config/dealerConfig";
import { PageHeading } from "../components/Common";
import { LeadForm } from "../components/LeadForm";
export default function Contact() {
  return (
    <section className="section contact-page">
      <PageHeading
        eyebrow="THE ROAD AHEAD IS YOURS"
        title={`READY TO ${d.shortName}?`}
        description="Let’s start a conversation about your next chapter."
      />
      <div className="contact-layout">
        <div className="contact-info">
          <span className="eyebrow">VISIT. CALL. CONNECT.</span>
          <h2>{d.name}</h2>
          <div>
            <MapPin size={20} />
            <p>
              {d.contact.address}
              <br />
              {[d.contact.city, d.contact.state, d.contact.zip]
                .filter(Boolean)
                .join(" ")}
            </p>
          </div>
          <div>
            <Phone size={20} />
            {d.contact.phone ? (
              <a href={`tel:${d.contact.phone}`}>{d.contact.phone}</a>
            ) : (
              <p>Phone awaiting dealer verification</p>
            )}
          </div>
          {d.contact.email && (
            <div>
              <Mail size={20} />
              <a href={`mailto:${d.contact.email}`}>{d.contact.email}</a>
            </div>
          )}
          <div>
            <Clock size={20} />
            <p>
              {d.contact.hours.map((h) => (
                <span className="hours-line" key={h}>
                  {h}
                </span>
              ))}
            </p>
          </div>
          <div className="contact-buttons">
            {d.contact.phone && (
              <a href={`tel:${d.contact.phone}`} className="button gold">
                Call dealer <ArrowUpRight size={16} />
              </a>
            )}
            {d.contact.sms && (
              <a href={`sms:${d.contact.sms}`} className="button outlined">
                Text dealer <ArrowUpRight size={16} />
              </a>
            )}
            {d.contact.directionsURL && (
              <a
                className="button outlined"
                href={d.contact.directionsURL}
                target="_blank"
                rel="noreferrer"
              >
                Get directions <ArrowUpRight size={16} />
              </a>
            )}
          </div>
          {!d.contact.phone && (
            <p className="notice">
              This concept demo does not yet contain verified dealer contact
              details. Add real information in dealerConfig before launch.
            </p>
          )}
          <Link to="/inventory" className="text-link">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="marble contact-form">
          <span className="eyebrow">LET’S FIND YOUR NEXT DRIVE</span>
          <h2>Get in touch.</h2>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
