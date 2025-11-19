import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { SpecificationFilter } from "~/lib/types/specification";

interface ProductFilterProps {
  filter: SpecificationFilter;
  activeState: {
    values?: string[];
    min?: string;
    max?: string;
  };
  onToggleMulti: (slug: string, value: string) => void;
  onBooleanChange: (slug: string, value: string | null) => void;
  onNumericChange: (slug: string, type: "min" | "max", value: string) => void;
  onTextChange: (slug: string, value: string) => void;
}

const getSelectValues = (filter: SpecificationFilter) => {
  const { options } = filter;
  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map((option) => String(option));
  }

  if (
    typeof options === "object" &&
    options !== null &&
    "values" in options &&
    Array.isArray((options as { values: unknown[] }).values)
  ) {
    return (options as { values: unknown[] }).values.map((value) =>
      String(value)
    );
  }

  return [];
};

const getNumberOptionDefaults = (
  filter: SpecificationFilter
): { min?: number; max?: number; step?: number } => {
  const { options } = filter;
  if (
    options &&
    typeof options === "object" &&
    options !== null &&
    !Array.isArray(options) &&
    !("values" in options)
  ) {
    const { min, max, step } = options as {
      min?: number;
      max?: number;
      step?: number;
    };
    return { min, max, step };
  }

  return {};
};

const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 300
) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );
};

export function ProductFilter({
  filter,
  activeState,
  onToggleMulti,
  onBooleanChange,
  onNumericChange,
  onTextChange,
}: ProductFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localValues, setLocalValues] = useState<string[]>(
    activeState.values ?? []
  );
  const [localMin, setLocalMin] = useState(activeState.min ?? "");
  const [localMax, setLocalMax] = useState(activeState.max ?? "");
  const debouncedToggleMulti = useDebouncedCallback(onToggleMulti, 300);
  const debouncedBooleanChange = useDebouncedCallback(onBooleanChange, 300);
  const debouncedNumericChange = useDebouncedCallback(onNumericChange, 300);
  const debouncedTextChange = useDebouncedCallback(onTextChange, 300);
  const activeValuesKey = JSON.stringify(activeState.values ?? []);

  useEffect(() => {
    setLocalValues(activeState.values ?? []);
  }, [activeValuesKey]);

  useEffect(() => {
    setLocalMin(activeState.min ?? "");
  }, [activeState.min]);

  useEffect(() => {
    setLocalMax(activeState.max ?? "");
  }, [activeState.max]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleValue = (value: string) => {
    setLocalValues((previous) => {
      if (previous.includes(value)) {
        return previous.filter((entry) => entry !== value);
      }

      return [...previous, value];
    });

    debouncedToggleMulti(filter.slug, value);
  };

  const handleBooleanChange = (nextValue: string) => {
    const normalized = nextValue.trim();
    setLocalValues(normalized ? [nextValue] : []);
    debouncedBooleanChange(filter.slug, normalized ? nextValue : null);
  };

  const handleNumberChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setLocalMin(value);
    } else {
      setLocalMax(value);
    }

    debouncedNumericChange(filter.slug, type, value);
  };

  const handleTextChange = (value: string) => {
    setLocalValues(value ? [value] : []);
    debouncedTextChange(filter.slug, value);
  };

  const isActive =
    (activeState.values && activeState.values.length > 0) ||
    (activeState.min && activeState.min.length > 0) ||
    (activeState.max && activeState.max.length > 0);

  const renderContent = () => {
    switch (filter.type) {
      case "select": {
        const values = getSelectValues(filter);
        if (!values.length)
          return (
            <div className="text-sm text-muted-foreground">No options</div>
          );

        return (
          <div className="space-y-2">
            {values.map((value) => {
              const isChecked = localValues.includes(value);
              return (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                    checked={!!isChecked}
                    onChange={() => handleToggleValue(value)}
                  />
                  <span>{value}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case "boolean": {
        const current = localValues[0] ?? " ";
        return (
          <Select value={current} onValueChange={handleBooleanChange}>
            <SelectTrigger>
              <SelectValue placeholder="Обрати" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Усі</SelectItem>
              <SelectItem value="true">Так</SelectItem>
              <SelectItem value="false">Ні</SelectItem>
            </SelectContent>
          </Select>
        );
      }
      case "number": {
        const defaults = getNumberOptionDefaults(filter);
        return (
          <div className="flex gap-2">
            <div className="flex-1">
              <span className="sr-only">Min</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder={defaults.min?.toString() ?? "Min"}
                value={localMin}
                onChange={(e) => handleNumberChange("min", e.target.value)}
                min={defaults.min}
                max={defaults.max}
                step={defaults.step}
                className="h-8"
              />
            </div>
            <span className="min-w-0">-</span>
            <div className="flex-1">
              <span className="sr-only">Max</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder={defaults.max?.toString() ?? "Max"}
                value={localMax}
                onChange={(e) => handleNumberChange("max", e.target.value)}
                min={defaults.min}
                max={defaults.max}
                step={defaults.step}
                className="h-8"
              />
            </div>
          </div>
        );
      }
      case "text":
      default: {
        return (
          <Input
            placeholder="Value..."
            value={localValues[0] ?? ""}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        );
      }
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <Button
        variant={isActive ? "secondary" : "outline"}
        className={cn(
          "h-9 px-3 font-normal justify-between gap-2 min-w-[120px]",
          isActive && "border-primary/50 bg-primary/5"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{filter.label}</span>
        {isActive && activeState.values?.length ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {activeState.values.length}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-md border bg-popover p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <div className="mb-2 font-medium text-sm">
            {filter.label} {filter.unit && `(${filter.unit})`}
          </div>
          {renderContent()}
        </div>
      )}
    </div>
  );
}
