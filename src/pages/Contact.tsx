import { dealerConfig as d } from "../config/dealerConfig";
import { PageHeading } from "../components/Common";
import { DealerLocation } from "../components/DealerLocation";
import { LeadForm } from "../components/LeadForm";
export default function Contact() {
  return (
    <section className="section contact-page">
      <PageHeading
        eyebrow="YOUR NEXT DESTINATION"
        title={`VISIT ${d.shortName}.`}
        description="Find your way here. Let’s start your next chapter."
      />
      <DealerLocation />
      <div className="contact-conversation">
        <div>
          <span className="eyebrow">READY TO MAKE YOUR NEXT MOVE?</span>
          <h2>
            Let’s talk about
            <br />
            the road ahead.
          </h2>
          <p>
            A question about a vehicle? Exploring your options? Start a
            conversation here.
          </p>
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
