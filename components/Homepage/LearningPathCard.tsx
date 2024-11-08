import Image from 'next/image';
import styles from '../../styles/LearningPathCard.module.css';

interface LearningPathCardProps {
  doc: {
    name: string;
    logo?: {
      url: string;
      alt: string;
    };
    link: string;
  };
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ doc }) => {
  const { name, logo, link } = doc;

  return (
    <a
      href={link}
      className={`${styles.learningPathCard} flex items-center p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl transition-transform transform hover:scale-[1.02] hover:border-primary border border-transparent`}
    >
      {logo && (
        <div className="mr-3">
          <Image src={logo.url} alt={logo.alt} width={32} height={32} className="rounded-md" />
        </div>
      )}
      <h4 className="text-md font-semibold text-white">{name}</h4>
    </a>
  );
};

export default LearningPathCard;
