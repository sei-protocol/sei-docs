import { Card, Cards } from 'nextra/components';

export const APIModulePaths = ({ basePaths, prefix }: { basePaths: any[]; prefix: string }) => {
	return (
		<Cards>
			{Object.values(basePaths).map((path) => {
				return <Card key={path} title={path} href={`/endpoints/cosmos/api/${prefix}/${path}`} icon={null} children={null} />;
			})}
		</Cards>
	);
};
