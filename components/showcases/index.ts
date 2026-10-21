import type { ComponentType } from "react";
import type { Showcase } from "@/content/types";
import { OpsConsole } from "./ops-console";

/** Heading level for the showcase's own headings, so it nests correctly wherever it is placed. */
export type ShowcaseProps = { headingLevel?: 2 | 3 | 4 };

/** Interactive schematic per project. Add new showcases here as they are built. */
export const showcases: Partial<Record<Showcase, ComponentType<ShowcaseProps>>> = {
  "ops-console": OpsConsole,
};
