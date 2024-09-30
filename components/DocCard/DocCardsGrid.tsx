import { docsData } from '../../data/docsData';
import DocCard from './DocCard';

const DocCardsGrid = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {docsData.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
};

export default DocCardsGrid;
