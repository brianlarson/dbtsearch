import { useEffect } from "react";
import useStore from "../../zustand/store";

import PageHeader from "../PageHeader/PageHeader";
import ProviderList from "../ProviderList/ProviderList";

function Search() {
  const { providers, fetchProviders } = useStore();
  // const providers = useStore((state) => state.providers);
  // const fetchProviders = useStore((state) => state.fetchProviders);

  useEffect(() => {
    fetchProviders();
  }, [providers]);

  return (
    <>
      <PageHeader
        pageHeading="Search"
        pageSubheading="DBT Providers in Minnesota"
      />
      <ProviderList providers={providers} />
      {/* <pre className="m-5">{JSON.stringify(providers)}</pre> */}
    </>
  );
}

export default Search;
