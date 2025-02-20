import PageHeader from "../PageHeader/PageHeader";
import Container from "../Container/Container";

function Error404() {
  return (
    <>
      <PageHeader pageHeading="Error 404" pageSubheading="Page Not Found" />
      <Container>
        <p className="pb-5">
          The resource you're looking for doesn't exist, has been removed or no
          longer exists. Total bummer, dude.
        </p>
      </Container>
    </>
  );
}

export default Error404;
