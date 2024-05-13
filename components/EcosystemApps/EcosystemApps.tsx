import React, { useState, useMemo, useEffect } from 'react';
import { EcosystemCard, EcosystemCards } from '../EcosystemCard';
import appData from '../../data/appData';  // Ensure this import is correct

const EcosystemApps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allTags, setAllTags] = useState([]);

  // Extract unique tags from appData
  useEffect(() => {
    const tags = new Set();
    appData.forEach(app => app.tags.forEach(tag => tags.add(tag)));
    setAllTags(Array.from(tags));
  }, []);
  // Filter by "title" and "tag" fields from appData.ts // Filter by "title" and "tag" fields from appData.ts
  const filteredApps = useMemo(() => (
    appData.filter(app =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ), [searchTerm]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search apps by name or tag..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 text-sm border rounded shadow-sm placeholder-gray-400"
      />
      <div className="mt-2 mb-4 text-sm text-gray-600">
        <strong>Filter by Tags:</strong> {allTags.join(', ')}
      </div>
      <EcosystemCards>
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <EcosystemCard
              key={app.title}
              title={app.title}
              description={app.description}
              href={app.href}
              image={app.image}
            />
          ))
        ) : (
          <div className="text-center text-gray-500">No apps found.</div>
        )}
      </EcosystemCards>
    </div>
  );
};

export default EcosystemApps;
