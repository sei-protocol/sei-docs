export interface DetailItem {
    label: string;
    content: string;
  }
  
  export interface ReferenceGuideSection {
    content: string;
    command?: string;
  }
  
  export interface ReferenceGuide {
    title: string;
    sections: ReferenceGuideSection[];
  }
  
  export type DetailItemOrReferenceGuide = DetailItem | ReferenceGuide;
  
  export interface TokenCardProps {
    title: string;
    description?: string;
    tooltip?: string;
    details: DetailItemOrReferenceGuide[];
    referenceGuides?: ReferenceGuide[];
  }