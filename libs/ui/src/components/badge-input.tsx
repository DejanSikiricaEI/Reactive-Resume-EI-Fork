import type { Dispatch, SetStateAction } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

import type { InputProps } from "./input";
import { Input } from "./input";

type BadgeInputProps = Omit<InputProps, "value" | "onChange"> & {
  value: string[];
  onChange: (value: string[]) => void;
  setPendingKeyword?: Dispatch<SetStateAction<string>>;
};

const SUGGESTIONS = [".NET", "python", "C#", "javascript", "html"];

export const BadgeInput = forwardRef<HTMLInputElement, BadgeInputProps>(
  ({ value, onChange, setPendingKeyword, ...props }, ref) => {
    const [label, setLabel] = useState("");

    const processInput = useCallback(() => {
      const newLabels = label
        .split(",")
        .map((str) => str.trim())
        .filter(Boolean)
        .filter((str) => !value.includes(str));
      onChange([...new Set([...value, ...newLabels])]);
      setLabel("");
    }, [label, value, onChange]);

    useEffect(() => {
      if (label.includes(",")) {
        processInput();
      }
    }, [label, processInput]);

    useEffect(() => {
      if (setPendingKeyword) setPendingKeyword(label);
    }, [label, setPendingKeyword]);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        processInput();
      }
    };

    const filteredSuggestions = label
      ? SUGGESTIONS.filter(
          (s) => s.toLowerCase().includes(label.trim().toLowerCase()) && !value.includes(s),
        )
      : [];

    const handleSuggestionClick = (suggestion: string) => {
      if (!value.includes(suggestion)) {
        onChange([...new Set([...value, suggestion])]);
      }
      setLabel("");
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          value={label}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            setLabel(event.target.value);
          }}
        />

        {filteredSuggestions.length > 0 && (
          <ul className="absolute inset-x-0 z-50 mt-1 max-h-48 overflow-auto rounded border bg-white shadow">
            {filteredSuggestions.map((s) => (
              <li
                key={s}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  handleSuggestionClick(s);
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
