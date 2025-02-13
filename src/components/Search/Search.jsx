import { useEffect } from "react";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";
import ProviderList from "../ProviderList/ProviderList";

function Search() {
  const providers = useStore((state) => state.providers);
  const fetchProviders = useStore((state) => state.fetchProviders);

  useEffect(() => {
    fetchProviders();
  }, [providers]);

  return (
    <>
      <pre>{JSON.stringify(providers)}</pre>
      {/* <PageHeader
        pageHeading="Search"
        pageSubheading="DBT Providers in Minnesota"
      />
      <ProviderList /> */}
    </>
  );
}

export default Search;
