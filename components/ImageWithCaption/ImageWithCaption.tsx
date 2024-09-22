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

// interface ImageWithCaptionProps {
//   img: string;
//   alt: string;
//   width?: number; // Optional
//   height?: number; // Optional
// }

// const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({ img, alt, width, height }) => {
//   return (
//     <Image 
//       src={img} 
//       alt={alt} 
//       width={width || undefined} // Set to undefined if not provided
//       height={height || undefined} // Set to undefined if not provided
//     />
//   );
// };

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
        width={width || undefined} // Set to undefined if not provided
        height={height || undefined} // Set to undefined if not provided
        />
      {caption && <p className="text-gray-400">{caption}</p>}
    </div>
  );
}
