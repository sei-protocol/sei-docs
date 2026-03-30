interface ImageWithCaptionProps {
	img: string | { src: string; height?: number; width?: number };
	alt: string;
	caption?: string;
}

export default function ImageWithCaption({ img, alt, caption }: ImageWithCaptionProps) {
	const src = typeof img === 'string' ? img : img.src;

	return (
		<div className={'my-4 flex flex-col items-center justify-center gap-2'}>
			<img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />
			{caption && <p className='text-gray-400'>{caption}</p>}
		</div>
	);
}
