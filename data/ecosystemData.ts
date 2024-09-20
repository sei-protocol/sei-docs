export type EcosystemAppLogoType = {
	fileId: string;
	url: string;
	alt: string | null;
};

export type EcosystemFieldData = {
	'featured-app': boolean;
	profile: string;
	link: string;
	'sei-only': boolean;
	name: string;
	logo: EcosystemAppLogoType;
	slug: string;
	categorie: string;
	'docs-category': string;
	'integration-guide-link': string;
	'short-description': string;
	'categorie-2': string;
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
	const url = 'http://app-api.seinetwork.io/webflow/ecosystem'; // TODO: Move to ENV
	const headers = { Accept: 'application/json' };

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		return { data: [] };
	}
}

export type EcosystemDocsCategory = 'indexer' | 'explorer' | 'wallet' | 'centralized-exchange' | 'rpc-provider' | 'faucet' | 'launchpad' | 'oracle' | 'bridge';

export async function getSeiEcosystemAppByCategory(category: EcosystemDocsCategory): Promise<EcosystemResponse> {
	const url = `https://app-api.seinetwork.io/webflow/ecosystem/docs/${category}`;
	const headers = { Accept: 'application/json' };

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		return { data: [] };
	}
}
