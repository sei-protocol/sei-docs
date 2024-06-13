import { Tag, appData } from "../../data/appData";
import AppCard from "./AppCard";

const AppCardsGrid = ({ tags }: { tags?: Tag[] }) => {
  const filteredData = (() => {
    if (!tags) return appData;

    return appData.filter((app) => tags.some((tag) => app.tags.includes(tag)));
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
      {filteredData.map((app, index) => (
        <AppCard key={index} app={app} />
      ))}
    </div>
  );
};

export default AppCardsGrid;
