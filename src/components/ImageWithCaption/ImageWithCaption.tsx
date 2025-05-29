import Image, { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

interface ImageWithCaption {
  img: StaticImageData | string;
  alt: string;
  caption?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ImageWithCaption({
  img,
  alt,
  caption,
  className,
  width,
  height,
}: ImageWithCaption) {
  // If img is a string (CDN URL), we need to provide width/height or use fill
  const isStringUrl = typeof img === 'string';
  
  return (
    <div
      className={twMerge(
        "my-4 flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      {isStringUrl ? (
        <Image 
          src={img} 
          alt={alt} 
          width={width || 800} 
          height={height || 600}
          style={{ width: 'auto', height: 'auto' }}
        />
      ) : (
        <Image src={img} alt={alt} />
      )}
      {caption && <p className="text-gray-400">{caption}</p>}
    </div>
  );
}
