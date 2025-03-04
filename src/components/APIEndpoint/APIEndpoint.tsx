import { Box, Code } from '@radix-ui/themes';
import { EndpointResponseProperty, EndpointParameter, Endpoint } from './types';
import Link from 'next/link';
import { SyntaxHighlighter } from '../SyntaxHighlighter';

const renderProperties = (properties: EndpointResponseProperty) => {
	return Object.entries(properties).map(([key, value]) => (
		<div className='rounded-xl bg-neutral-100 dark:bg-neutral-900  border-neutral-200 dark:border-neutral-800 border-2 p-4' key={key}>
			<div className='flex gap-6'>
				<strong>{key}</strong>
				<Code color='gray' variant='soft'>
					{value.type}
				</Code>
			</div>
			<p>{value.description}</p>
			{value.properties && (
				<div className='flex flex-col gap-2'>
					<p className='text-xl'>Properties</p>
					{renderProperties(value.properties)}
				</div>
			)}
		</div>
	));
};

const getRouteNames = (operationId: string, parts: string[]) => {
	let upperCaseFunctionName = operationId.toUpperCase();

	upperCaseFunctionName = upperCaseFunctionName.replace('SEIPROTOCOL', '');
	upperCaseFunctionName = upperCaseFunctionName.replace('XV1BETA1', '');

	for (let i = 0; i < parts.length - 1; i++) {
		// Remove the '-' in 'sei-chain'
		const uppercasePart = parts[i].replace('-', '').toUpperCase();
		upperCaseFunctionName = upperCaseFunctionName.replace(uppercasePart, '');
	}

	const indexOf = operationId.toUpperCase().lastIndexOf(upperCaseFunctionName);
	const typeName = operationId.slice(indexOf);

	return {
		functionName: typeName.charAt(0).toLowerCase() + operationId.slice(indexOf + 1),
		typeName
	};
};

const unquotedStringify = (obj: object) => {
	if (!obj) return '{}';
	const entries = Object.entries(obj);
	const properties = entries.map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
	return `{ \n\t${properties.join(',\n\t')}\n }`;
};

const Parameter = (params: EndpointParameter) => {
	const { name, description, type, required, format } = params;
	return (
		<div className='rounded-xl bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 border-2 p-4' key={name}>
			<div className='flex gap-6'>
				<strong>
					{name}
					{required && <span>*</span>}
				</strong>
				<Code color='gray' variant='soft'>
					{type}
				</Code>
				{format && (
					<Code color='gray' variant='soft'>
						{format}
					</Code>
				)}
				<Code color='gray' variant='soft'>
					{params['in']}
				</Code>
			</div>
			<p>{description}</p>
		</div>
	);
};

const EndpointResponse = ([code, response]) => {
	return (
		<div className='flex flex-col gap-4'>
			<Box>
				<strong>{code}</strong>
				<p>{response.description}</p>
			</Box>
			<Box>{response.schema && response.schema.properties && <div className='flex flex-col gap-4'>{renderProperties(response.schema.properties)}</div>}</Box>
		</div>
	);
};

export const APIEndpoint = ({ endpoint }: { endpoint: Endpoint }) => {
	const [path, methods] = endpoint;

	const parts = path
		?.split('/')
		.filter((part: string) => !part.startsWith('{') && part !== '')
		.map((part: string) => part.toLowerCase());

	const orgName = parts[0];
	const moduleName = parts[1];
	const version = parts[2];
	const functionName = parts[parts.length - 1];

	const method = Object.entries(methods)[0];

	const [httpMethod, details] = method;

	const routeNames = getRouteNames(details.operationId, parts);

	const requestType = `Query${routeNames.typeName}Request`;
	const responseType = `Query${routeNames.typeName}ResponseSDKType`;

	const requiredParams = details.parameters?.filter((param) => param.required);
	const optionalParams = details.parameters?.filter((param) => !param.required);

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
const response: ${responseType} = await ${routeNames.functionName}(params);`;

	return (
		<div className='flex flex-col gap-8'>
			<div className='flex flex-row items-center gap-2'>
				<a className='text-neutral-400' href={`/reference/cosmos#${orgName}`}>
					endpoints
				</a>
				<p>
					<b>{'>'}</b>
				</p>
				<a className='text-neutral-400' href={`/reference/api/${orgName}/${moduleName}`}>
					{moduleName}
				</a>
				<p>
					<b>{'>'}</b>
				</p>
				<p className='font-2xl'>{functionName}</p>
			</div>
			<div className='flex flex-row gap-2 items-center'>
				<Code className='mt-1'>{httpMethod.toUpperCase()}</Code>
				<p className='text-2xl break-all'>{path}</p>
			</div>
			<p className='font-xl break-all'>{details.summary}</p>
			{requiredParams?.length > 0 && (
				<div className='flex flex-col gap-2'>
					<p className='text-xl font-bold'>Parameters</p>
					{requiredParams.map(Parameter)}
				</div>
			)}

			{optionalParams?.length > 0 && (
				<div className='flex flex-col gap-2'>
					<p className='text-xl font-bold'>Optional Parameters</p>
					{optionalParams?.map(Parameter)}
				</div>
			)}

			<div className='flex flex-col gap-2'>
				<p className='text-xl font-bold'>Responses</p>
				{Object.entries(details.responses).map(EndpointResponse)}
			</div>
			<div className='flex flex-col gap-2'>
				<p className='text-xl'>Example Usage</p>
				<SyntaxHighlighter language='typescript' code={exampleCode} />
			</div>
		</div>
	);
};
