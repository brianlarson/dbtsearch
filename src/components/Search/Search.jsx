import { useState } from "react";
import axios from "axios";

import PageHeader from "../PageHeader/PageHeader";
import ProviderList from "../ProviderList/ProviderList";

function Search() {
  const [providers, setProvider] = useState([]);

  

  return (
    <>
      <PageHeader
        pageHeading="Search"
        pageSubheading="DBT Providers in Minnesota"
      />
      <ProviderList />
    </>
  );
}

export default Search;
