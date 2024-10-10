import { Card } from 'nextra/components';

export const APIModule = ({ basePaths, prefix }: { basePaths: any[]; prefix: string }) => {
	return Object.values(basePaths).map((path) => {
		return <Card children={null} icon={null} key={path} title={path.replace(`/${prefix}`, '')} href={`/endpoints/cosmos/api${path}`} />;
	});
};
