import PageHeader from "../PageHeader/PageHeader";
import Container from "../Container/Container";

function Logout() {
  return (
    <>
      <PageHeader pageHeading="Thank you!" />
      <Container>
        <p>
          You are now logged out of the system.
          <br />
          <a className="text-brand" href="/login">
            Click here
          </a>{" "}
          if you would like to login again.
        </p>
      </Container>
    </>
  );
}

export default Logout;
