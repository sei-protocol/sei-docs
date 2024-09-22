import Image, { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

interface ImageWithCaption {
  img: StaticImageData;
  alt: string;
  caption?: string;
  className?: string;
  width?: number; // Optional
  height?: number; // Optional
}
export default function ImageWithCaption({
  img,
  alt,
  caption,
  className,
  width,
  height,
}: ImageWithCaption) {
  return (
    <div
      className={twMerge(
        "my-4 flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Image 
        src={img} 
        alt={alt}
        {...(width && { width })}
        {...(height && { height })}
        />
      {caption && <p className="text-gray-400">{caption}</p>}
    </div>
  );
}
