import DocCard from './DocCard';

const DocCardsGrid = ({ data = [] }) => {
  if (!Array.isArray(data)) {
    console.error("Expected an array for data but received:", data);
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
};

export default DocCardsGrid;
