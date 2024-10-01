import { ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';

interface DocCardProps {
  doc: {
    name: string;
    logo?: {
      url: string;
      alt: string;
    };
    link: string;
    'short-description': string;
  };
}

const DocCard = ({ doc }: DocCardProps) => {
  const { name, logo, link, 'short-description': shortDescription } = doc;

  return (
    <div className="group flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {logo ? (
          <Image src={logo.url} alt={logo.alt} layout="fill" objectFit="cover" className="transition-all duration-300 ease-in-out group-hover:scale-110" />
        ) : (
          <span className="text-gray-400">No image available</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{shortDescription}</p>
        <div className="mt-auto">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 inline-flex items-center font-medium hover:underline"
          >
            Learn more <ExternalLinkIcon className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocCard;
