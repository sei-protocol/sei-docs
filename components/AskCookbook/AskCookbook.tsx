import React from "react";
import dynamic from "next/dynamic";

interface BaseAskCookbookProps {
  apiKey: string;
}

const BaseAskCookbook = dynamic<BaseAskCookbookProps>(() => import("@cookbookdev/docsbot/react"), { ssr: false });

const COOKBOOK_PUBLIC_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjdlZmMxYjcyYzRmNTI5YzMxODUyZmUiLCJpYXQiOjE3MTk1OTgxMDcsImV4cCI6MjAzNTE3NDEwN30.etICfDHEcewxP9QTajrS4ggral2IgaxY_rWAlK4kNiQ";

export const AskCookbook = () => {
  return <BaseAskCookbook apiKey={COOKBOOK_PUBLIC_API_KEY} />;
};
