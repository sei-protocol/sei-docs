import Image, { StaticImageData } from "next/image";

interface CardProps {
  image: StaticImageData;
  title: string;
  description: string;
  href: string;
}

interface CardsProps {
  children: React.ReactNode;
}

function Card({ image, title, description, href }: CardProps) {
  return (
    <a
      className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:opacity-80"
      href={href}
      target="_blank"
      rel="noopener"
    >
      <div>
        <Image src={image} alt={title} />
      </div>
      <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800">
        <p className="text-lg font-semibold mb-2">{title}</p>
        <p>{description}</p>
      </div>
    </a>
  );
}

function Cards({ children }: CardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 my-4">{children}</div>
  );
}

export { Card, Cards };
