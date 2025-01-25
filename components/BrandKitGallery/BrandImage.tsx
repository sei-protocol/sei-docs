import { useState, useEffect } from 'react';
import NextImage from 'next/image';

interface BrandImageProps {
	url: string;
	alt: string;
	name: string;
}

export default function BrandImage({ url, alt, name }: BrandImageProps) {
	const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		const img = new window.Image();
		img.src = url;
		img.onload = () => {
			setImageDimensions({ width: img.width, height: img.height });
		};
	}, [url]);

	function handleImageClick() {
		setShowModal(true);
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		setShowModal(false);
		document.body.style.overflow = 'auto';
	}

	return (
		<>
			<div
				className='
          my-8 
          text-center 
          relative 
          cursor-pointer 
          hover:scale-105 
          transition-transform 
          duration-300
        '>
				<div className='flex justify-center items-center'>
					<NextImage
						src={url}
						alt={alt}
						width={imageDimensions.width}
						height={imageDimensions.height}
						className='
              rounded-md
              shadow-[0_4px_8px_rgba(0,0,0,0.1)]
            '
						onClick={handleImageClick}
					/>
				</div>
			</div>

			{showModal && (
				<div
					className='
            fixed 
            inset-0 
            flex 
            justify-center 
            items-center 
            bg-black/80 
            z-[1000]
          '
					onClick={closeModal}>
					<div className='relative w-[80%] h-[80%]'>
						<NextImage src={url} alt={alt} fill style={{ objectFit: 'contain' }} />
					</div>
				</div>
			)}
		</>
	);
}
