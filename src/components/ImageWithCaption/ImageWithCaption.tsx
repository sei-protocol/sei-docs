import Image, { StaticImageData } from 'next/image';

interface ImageWithCaption {
	img: StaticImageData;
	alt: string;
	caption?: string;
}

export default function ImageWithCaption({ img, alt, caption }: ImageWithCaption) {
	return (
		<div className={'my-4 flex flex-col items-center justify-center gap-2'}>
			<Image src={img} alt={alt} />
			{caption && <p className='text-gray-400'>{caption}</p>}
		</div>
	);
}
