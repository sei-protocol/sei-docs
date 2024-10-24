import DocCard from './DocCard';

const DocCardsGrid = ({ data = [] }) => {
  if (!Array.isArray(data)) {
    console.error("Expected an array for data but received:", data);
    return null;
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {data.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
};

export default DocCardsGrid;
