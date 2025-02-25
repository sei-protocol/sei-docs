import { Cards } from 'nextra/components';

export const APIModule = ({ basePaths, prefix }: { basePaths: any[]; prefix: string }) => {
	return Object.values(basePaths).map((path) => {
		return <Cards.Card children={null} icon={null} key={path} title={path.replace(`/${prefix}`, '')} href={`/reference/api${path}`} />;
	});
};
