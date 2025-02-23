import PageHeader from "../PageHeader/PageHeader";
import Container from "../Container/Container";

function About() {
  return (
    <>
      <PageHeader
        pageHeading="About"
        pageSubheading="DBT provider availability in Minnesota"
      />
      <Container>
        <p>
          DBTsearch is a website that allows clinicians and prospective clients
          to search for certified DBT providers in Minnesota and more
          specifically, locate providers that have current availability.
          Dialectical Behavior Therapy (DBT) is a highly structured, empirically
          supported therapy that helps people learn to manage intense emotions
          and get behaviors under control. It is used to treat mental health
          conditions rooted in severe emotional and behavioral dysregulation
          often present in untreated Borderline Personality Disorder,
          Posttraumatic Stress Disorder, Bipolar Disorder, Major Depression, and
          more.
        </p>
        <p>
          Frequently people in need of DBT are in crisis and are at high risk
          for suicide, and are often unable to tolerate the patience required to
          find available providers. Referring providers are busy and often do
          not have the time to call around in order to provide reliable referral
          information to clients. This is because the current process of finding
          an available provider is cumbersome and inefficient, combined with the
          reality of high demand and low access to certified DBT programs.
        </p>
        <p>
          The Minnesota Department of Human Services offers a single page with a
          long list of certified DBT providers but the only way to discover
          availability is to go through the list and call or email each clinic.
          DBTsearch aims to ease the process of finding access to this treatment
          by offering a searchable list of DBT providers where those with
          current availability appear first. Clients get faster access to
          treatment, providers have more time, and treatment programs remain
          full: win-win-win!
        </p>
        <a href="/providers" className="btn btn-lg btn-primary mt-3">
          Find DBT Providers<i className="fi-arrow-right fs-base ms-2"></i>
        </a>
      </Container>
    </>
  );
}

export default About;
