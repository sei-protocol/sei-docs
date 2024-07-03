export type EcosystemAppLogoType = {
  fileId: string;
  url: string;
  alt: string | null;
};

export type EcosystemFieldData = {
  "featured-app": boolean;
  profile: string;
  link: string;
  "sei-only": boolean;
  name: string;
  slug: string;
  logo: EcosystemAppLogoType;
  categorie: string;
};

export type EcosystemItem = {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: EcosystemFieldData;
};

export type EcosystemResponse = {
  data: EcosystemItem[];
};

export async function getSeiEcosystemAppsData(): Promise<EcosystemResponse> {
  const url = "http://staging.app-api.seinetwork.io/webflow/ecosystem"; // TODO: Move to ENV
  const headers = { Accept: 'application/json' };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Sei Ecosystem data", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { data: [] };
  }
}