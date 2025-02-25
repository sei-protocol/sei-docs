import { Cards } from 'nextra/components';

export const APIModulePaths = ({ basePaths, prefix }: { basePaths: any[]; prefix: string }) => {
	return (
		<Cards>
			{Object.values(basePaths).map((path) => {
				return <Cards.Card key={path} title={path} href={`/reference/api/${prefix}/${path}`} icon={null} children={null} />;
			})}
		</Cards>
	);
};
