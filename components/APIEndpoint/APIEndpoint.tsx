import React, { useState } from 'react';
import { EndpointResponseProperty, EndpointParameter, Endpoint } from './types';

// Simple "Paper" style
function Paper({ children }: { children: React.ReactNode }) {
	return <div className='border p-4 rounded-md mb-4'>{children}</div>;
}

// Minimal "Code" style
function Code({ children }: { children: React.ReactNode }) {
	return <code className='bg-gray-200 text-sm px-1 rounded text-black dark:bg-gray-800 dark:text-gray-100'>{children}</code>;
}

// We replicate your "Parameter" rendering
function Parameter(params: EndpointParameter) {
	const { name, description, type, required, format } = params;
	return (
		<Paper key={name}>
			<div className='flex flex-wrap gap-2 items-center'>
				<strong className='mr-1'>
					{name}
					{required && <span className='ml-1 text-red-500'>*</span>}
				</strong>
				<Code>{type}</Code>
				<Code>{params.in}</Code>
				{format && (
					<div className='text-sm'>
						format: <Code>{format}</Code>
					</div>
				)}
			</div>
			<p className='mt-2 text-sm'>{description}</p>
		</Paper>
	);
}

// Renders nested properties
function renderProperties(properties: EndpointResponseProperty) {
	return Object.entries(properties).map(([key, value]) => (
		<Paper key={key}>
			<div className='flex items-center gap-4'>
				<strong>{key}</strong>
				<Code>{value.type}</Code>
			</div>
			<p className='text-sm mt-1'>{value.description}</p>
			{value.properties && (
				<div className='flex flex-col gap-2 mt-3'>
					<h5 className='text-base font-semibold'>Properties</h5>
					{renderProperties(value.properties)}
				</div>
			)}
		</Paper>
	));
}

// Minimal accordion for a single response
function AccordionItem({ code, response }: { code: string; response: any }) {
	const [open, setOpen] = useState(false);

	return (
		<div className='border-b last:border-0 py-2'>
			<button onClick={() => setOpen(!open)} className='flex flex-col w-full text-left hover:bg-gray-50 px-2 py-1 rounded transition-colors'>
				<strong className='text-sm mb-1'>{code}</strong>
				<p className='text-sm'>{response.description}</p>
			</button>
			{open && response.schema?.properties && (
				<div className='mt-2 ml-3'>
					<h5 className='text-sm font-semibold'>Properties</h5>
					{renderProperties(response.schema.properties)}
				</div>
			)}
		</div>
	);
}

// "EndpointResponse" in your code. We'll just map to an AccordionItem.
function EndpointResponse([code, response]) {
	return <AccordionItem key={code} code={code} response={response} />;
}

// Utility to produce an unquoted string
function unquotedStringify(obj: object) {
	if (!obj) return '{}';
	const entries = Object.entries(obj);
	const props = entries.map(([key, val]) => `${key}: ${JSON.stringify(val)}`);
	return `{\n  ${props.join(',\n  ')}\n}`;
}

// Utility from your snippet
function getRouteNames(operationId: string, parts: string[]) {
	let upperCaseFunctionName = operationId.toUpperCase();
	upperCaseFunctionName = upperCaseFunctionName.replace('SEIPROTOCOL', '');
	upperCaseFunctionName = upperCaseFunctionName.replace('XV1BETA1', '');

	for (let i = 0; i < parts.length - 1; i++) {
		const uppercasePart = parts[i].replace('-', '').toUpperCase();
		upperCaseFunctionName = upperCaseFunctionName.replace(uppercasePart, '');
	}

	const indexOf = operationId.toUpperCase().lastIndexOf(upperCaseFunctionName);
	const typeName = operationId.slice(indexOf);

	return {
		functionName: typeName.charAt(0).toLowerCase() + operationId.slice(indexOf + 1),
		typeName
	};
}

// Main "APIEndpoint" component
export function APIEndpoint({ endpoint }: { endpoint: Endpoint }) {
	const [path, methods] = endpoint;

	const parts = path
		.split('/')
		.filter((p) => !p.startsWith('{') && p !== '')
		.map((p) => p.toLowerCase());

	const orgName = parts[0];
	const moduleName = parts[1];
	const version = parts[2];
	const functionName = parts[parts.length - 1];

	const method = Object.entries(methods)[0];
	const [httpMethod, details] = method;

	const routeNames = getRouteNames(details.operationId, parts);

	const requestType = `Query${routeNames.typeName}Request`;
	const responseType = `Query${routeNames.typeName}ResponseSDKType`;

	const requiredParams = details.parameters?.filter((p) => p.required);
	const optionalParams = details.parameters?.filter((p) => !p.required);

	// Build a param string
	const paramsString = unquotedStringify(
		details.parameters
			?.filter((param) => param.required)
			.map((param) => param.name)
			.reduce((acc, curr) => ({ ...acc, [curr]: '' }), {})
	);

	const exampleCode = `
import { getQueryClient } from '@sei-js/cosmjs';

const queryClient = await getQueryClient("YOUR_RPC_URL");
const { ${routeNames.functionName} } = queryClient.${orgName}.${moduleName}.${version};

const params: ${requestType} = ${paramsString};
const response: ${responseType} = await ${routeNames.functionName}(params);
`.trim();

	return (
		<div className='flex flex-col gap-6'>
			{/* Breadcrumbs */}
			<nav className='flex items-center space-x-2 text-sm'>
				<a href={`/reference/cosmos#${orgName}`} className='text-blue-600 hover:underline'>
					endpoints
				</a>
				<span>/</span>
				<a href={`/reference/api/${orgName}/${moduleName}`} className='text-blue-600 hover:underline'>
					{moduleName}
				</a>
			</nav>

			<h2 className='text-2xl font-semibold'>{functionName}</h2>

			<div className='flex items-center gap-2'>
				<Code>{httpMethod.toUpperCase()}</Code>
				<p className='text-lg break-all'>{path}</p>
			</div>

			<h4 className='text-lg font-medium'>{details.summary}</h4>

			{requiredParams?.length > 0 && (
				<div className='flex flex-col gap-2'>
					<h4 className='text-lg font-medium'>Parameters</h4>
					{requiredParams.map((p) => (
						<Parameter key={p.name} {...p} />
					))}
				</div>
			)}

			{optionalParams?.length > 0 && (
				<div className='border rounded-md'>
					<button className='w-full text-left px-4 py-2 bg-gray-50 font-medium hover:bg-gray-100'>Optional Parameters</button>
					<div className='p-4'>
						<div className='flex flex-col gap-2'>
							{optionalParams.map((p) => (
								<Parameter key={p.name} {...p} />
							))}
						</div>
					</div>
				</div>
			)}

			{/* Responses */}
			<div className='flex flex-col gap-2'>
				<h4 className='text-lg font-medium'>Responses</h4>
				<div className='border rounded-md p-2'>{Object.entries(details.responses).map(EndpointResponse)}</div>
			</div>

			{/* Example Usage */}
			<div className='flex flex-col gap-2'>
				<h4 className='text-lg font-medium'>Example Usage</h4>
				<pre className='bg-gray-800 text-gray-100 text-sm p-4 rounded-md overflow-auto'>
					<code>{exampleCode}</code>
				</pre>
			</div>
		</div>
	);
}
