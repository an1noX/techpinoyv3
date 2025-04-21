
import { WikiToner, TonerType } from "@/types/types";
import { wikiTonerToTonerType } from "@/utils/typeHelpers";

interface TonerTypeAdapterProps {
  wikiToners: WikiToner[];
  children: (toners: TonerType[]) => React.ReactNode;
}

/**
 * Component that converts WikiToner[] to TonerType[] for compatibility with components
 * that expect TonerType
 */
export function TonerTypeAdapter({ wikiToners, children }: TonerTypeAdapterProps) {
  const tonerTypes = wikiToners.map(wikiTonerToTonerType);
  return <>{children(tonerTypes)}</>;
}
