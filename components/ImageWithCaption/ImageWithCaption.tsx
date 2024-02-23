import Image, { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

interface ImageWithCaption {
  img: StaticImageData;
  alt: string;
  caption?: string;
  className?: string;
}

export default function ImageWithCaption({
  img,
  alt,
  caption,
  className,
}: ImageWithCaption) {
  return (
    <div
      className={twMerge(
        "my-4 flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Image src={img} alt={alt} />
      {caption && <p className="text-gray-400">{caption}</p>}
    </div>
  );
}
