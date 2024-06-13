import { Tag, appData } from "../../data/appData";
import AppCard from "./AppCard";

const tagsMap: { [key: string]: Tag[] } = {
  betting: [Tag.BET, Tag.GAMES],
  bots: [Tag.BOT, Tag.TRADE, Tag.DEFI],
  bridge: [Tag.BRIDGE, Tag.DEFI],
  defi: [Tag.DEFI, Tag.TRADE, Tag.DEX],
  dex: [Tag.DEX, Tag.TRADE],
  gaming: [Tag.GAMES, Tag.TRADE],
  governance: [Tag.GOV, Tag.TRADE],
  indexer: [Tag.INDEX],
  launchpad: [Tag.LAUNCH, Tag.WS],
  lending: [Tag.LEND, Tag.TRADE],
  liquidity: [Tag.LIQ, Tag.TRADE],
  "liquid-staking": [Tag.LST, Tag.TRADE],
  marketplace: [Tag.MKT, Tag.TRADE],
  mev: [Tag.MEV, Tag.TRADE],
};

type TagsType = keyof typeof tagsMap;
const AppCardsGrid = ({ tags }: { tags?: TagsType[] }) => {
  const filteredData = (() => {
    if (!tags) return appData;
    let tempTags: Tag[] = [];
    tags.forEach((tag) => {
      if (tagsMap[tag]) tempTags = [...tempTags, ...tagsMap[tag]];
      else console.log(`${tag} is not a valid tag`);
    });

    // merge all tags and filter appData
    console.log(tempTags);

    return appData.filter((app) =>
      tempTags.some((tag) => app.tags.includes(tag))
    );
  })();

  // When no tags are passed, show all apps
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
      {filteredData.map((app, index) => (
        <AppCard key={index} app={app} />
      ))}
    </div>
  );
};

export default AppCardsGrid;
