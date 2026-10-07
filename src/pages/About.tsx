import { PageHeading } from "../components/Common";
import { AboutSection, ReviewSection } from "./Home";
import { dealerConfig as d } from "../config/dealerConfig";
export default function About() {
  return (
    <>
      <PageHeading
        eyebrow="A HIGHER STANDARD"
        title={`The ${d.shortName} perspective.`}
        description="An original dealership concept, designed around your next chapter."
      />
      <AboutSection />
      <ReviewSection />
      <p className="section notice">{d.legal.demo}</p>
    </>
  );
}
