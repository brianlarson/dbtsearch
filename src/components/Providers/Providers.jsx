import { useEffect, useState } from "react";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";
import ProviderList from "../ProviderList/ProviderList";

function Providers() {
  const { providers, fetchProviders } = useStore();
  const [showAll, setShowAll] = useState(false);

  const handleShowChange = () => {
    setShowAll((prevShowAll) => !prevShowAll);
  };

  useEffect(() => {
    fetchProviders(showAll);
  }, [showAll, fetchProviders]);

  return (
    <>
      <PageHeader
        pageHeading="Providers"
        pageSubheading="DBT Providers in Minnesota"
      />
      <ProviderList providers={providers} handleShowChange={handleShowChange} />
    </>
  );
}

export default Providers;
