import { Code, Flex, Paper, Title, Accordion, Breadcrumbs, Anchor, Text } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { EndpointResponseProperty, EndpointParameter, Endpoint } from './types';

const renderProperties = (properties: EndpointResponseProperty) => {
	return Object.entries(properties).map(([key, value]) => (
		<Paper key={key} withBorder p='md'>
			<Flex gap='lg'>
				<strong>{key}</strong>
				<Code>{value.type}</Code>
			</Flex>
			<p>{value.description}</p>
			{value.properties && (
				<Flex direction='column' gap='xs' mt='lg'>
					<Title order={5}>Properties</Title>
					{renderProperties(value.properties)}
				</Flex>
			)}
		</Paper>
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
		<Paper key={name} withBorder p='md'>
			<Flex gap='lg'>
				<strong>
					{name}
					{required && <span>*</span>}
				</strong>
				<Code>{type}</Code>
				<Code>{params['in']}</Code>
				{format && (
					<Text>
						format: <Code>{format}</Code>
					</Text>
				)}
			</Flex>
			<p>{description}</p>
		</Paper>
	);
};

const EndpointResponse = ([code, response]) => {
	return (
		<Accordion.Item key={code} value={code}>
			<Flex direction='column' gap='xs'>
				<Accordion.Control>
					<strong>{code}</strong>
					<p>{response.description}</p>
				</Accordion.Control>
				<Accordion.Panel>
					{response.schema && response.schema.properties && (
						<Flex direction='column' gap='xs'>
							<Title order={5}>Properties</Title>
							{renderProperties(response.schema.properties)}
						</Flex>
					)}
				</Accordion.Panel>
			</Flex>
		</Accordion.Item>
	);
};

export const APIEndpoint = ({ endpoint }: { endpoint: Endpoint }) => {
	const [path, methods] = endpoint;

	const parts = path
		.split('/')
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
		<Flex direction='column' gap='xl'>
			<Breadcrumbs mt='md'>
				<Anchor href={`/reference/cosmos#${orgName}`}>endpoints</Anchor>
				<Anchor href={`/reference/api/${orgName}/${moduleName}`}>{moduleName}</Anchor>
			</Breadcrumbs>
			<Title>{functionName}</Title>
			<Flex gap='sm' align='center'>
				<Code style={{ minWidth: 'fit-content', height: 'fit-content' }}>{httpMethod.toUpperCase()}</Code>
				<Text size='xl' style={{ wordBreak: 'break-all' }}>
					{path}
				</Text>
			</Flex>
			<Title order={4}>{details.summary}</Title>
			{!!requiredParams && (
				<Flex gap='sm' direction='column'>
					<Title order={4}>Parameters</Title>
					{requiredParams.map(Parameter)}
				</Flex>
			)}

			{optionalParams?.length > 0 && (
				<Accordion>
					<Accordion.Item value='optional'>
						<Accordion.Control>
							<Title order={4}>Optional Parameters</Title>
						</Accordion.Control>
						<Accordion.Panel>
							<Flex gap='sm' direction='column' mt='sm'>
								{optionalParams.map(Parameter)}
							</Flex>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			)}
			<Flex gap='sm' direction='column'>
				<Title order={4}>Responses</Title>
				<Accordion>{Object.entries(details.responses).map(EndpointResponse)}</Accordion>
			</Flex>
			<Flex gap='sm' direction='column'>
				<Title order={4}>Example Usage</Title>
				<CodeHighlight language='js' code={exampleCode} />
			</Flex>
		</Flex>
	);
};
