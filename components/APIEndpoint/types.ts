export type EndpointParameter = {
	name: string;
	in: string;
	description: string;
	required: boolean;
	type: string;
	format?: string;
};

export type EndpointResponseProperty = {
	[key: string]: {
		type: string;
		description: string;
		properties?: EndpointResponseProperty;
	};
};

export type EndpointResponses = {
	[code: string]: {
		description: string;
		schema: {
			properties: EndpointResponseProperty;
		};
	};
};

export type Endpoint = [
	string,
	{ get: { operationId: string; summary: string; description: string; parameters: EndpointParameter[]; responses: EndpointResponses } }
];
