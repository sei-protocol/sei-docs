import { Code } from '@radix-ui/themes';

type PropertyInfoProps = {
	name: string;
	description: string;
	properties?: { name: string; description: string }[];
};

const PropertyInfo = ({ name, description, properties }: PropertyInfoProps) => {
	return (
		<div className='flex flex-col border-[1px] rounded border-neutral-800 p-4 gap-6'>
			<div className='flex flex-col'>
				<p className='font-black text-xl'>{name}</p>
				<p>{description}</p>
			</div>
			{properties && (
				<div className='flex flex-col gap-4'>
					{properties.map((property) => {
						return (
							<div key={property.name} className='flex flex-col p-2 gap-1 border-[1px] rounded border-neutral-700'>
								<Code style={{ fontSize: '12pt', fontWeight: 500 }}>{property.name}</Code>
								<p>{property.description}</p>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default PropertyInfo;
