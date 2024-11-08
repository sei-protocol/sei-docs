import Image from 'next/image';
import { ExternalLinkIcon } from 'lucide-react';
import styles from '../../styles/DocCard.module.css';

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
    <a
      href={link}
      className={`${styles.docCard} group flex flex-col md:flex-row items-center bg-gradient-to-r from-[#780000] to-[#001B2A] rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform`}
      rel="noopener noreferrer"
    >
      <div className={`${styles.imageContainer} w-1/3 relative h-36 md:h-48`}>
        {logo ? (
          <Image
            src={logo.url}
            alt={logo.alt}
            layout="fill"
            objectFit="cover"
            className="rounded-l-xl"
          />
        ) : (
          <div className="flex items-center justify-center text-gray-400 w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-4a8 8 0 0116 0v4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 20h8m-4-4v4" />
            </svg>
            <span>No image available</span>
          </div>
        )}
      </div>
      <div className="flex-grow p-4 flex flex-col justify-between">
        <h3 className="text-lg font-semibold mb-2 tracking-tight text-[#ECEDEE]">{name}</h3>
        <p className="text-sm text-[#8CABA9] mb-3">{shortDescription}</p>
        <div className="flex items-center text-[#ECEDEE] font-medium group-hover:text-[#9E1F19]">
          Explore
          <ExternalLinkIcon className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
        </div>
      </div>
    </a>
  );
};

export default DocCard;
