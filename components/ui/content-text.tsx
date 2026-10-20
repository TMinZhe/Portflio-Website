import { isPlaceholder, type Text } from "@/content/types";

/** Renders content text; placeholders get the dashed amber "pending" style. */
export function T({ value }: { value: Text }) {
  if (isPlaceholder(value)) {
    return (
      <span className="placeholder" title="Placeholder — replace in /content">
        [{value.placeholder}]
      </span>
    );
  }
  return <>{value}</>;
}

export const plain = (value: Text) => (isPlaceholder(value) ? `[${value.placeholder}]` : value);
