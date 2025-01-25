import React from 'react';

type PropertyInfoProps = {
	name: string;
	description: string;
	properties?: { name: string; description: string }[];
};

export default function PropertyInfo({ name, description, properties }: PropertyInfoProps) {
	return (
		<div className='flex flex-col mt-4'>
			<p className='text-[14pt] font-semibold'>{name}</p>
			<p className='mt-2 text-base'>{description}</p>

			{properties && (
				<div className='p-4 border rounded mt-6'>
					{properties.map((property, i) => (
						<div key={property.name} className='mb-6 last:mb-0'>
							<code className='text-[12pt] font-medium bg-gray-100 px-1 py-0.5'>{property.name}</code>
							<p className='mt-2'>{property.description}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
