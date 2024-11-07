export interface TokenCardProps {
    title: string;
    description?: string;
    tooltip?: string;
    details: Array<{ label: string; content: string }>;
    referenceGuide?: Array<{ content: string; command?: string }>;
  }
