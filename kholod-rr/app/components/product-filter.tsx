import { useEffect, useRef, useState } from "react";
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
              const isChecked = activeState.values?.includes(value);
              return (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                    checked={!!isChecked}
                    onChange={() => onToggleMulti(filter.slug, value)}
                  />
                  <span>{value}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case "boolean": {
        const current = activeState.values?.[0] ?? "";
        return (
          <Select
            value={current}
            onValueChange={(next) => onBooleanChange(filter.slug, next || null)}
          >
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
                value={activeState.min ?? ""}
                onChange={(e) =>
                  onNumericChange(filter.slug, "min", e.target.value)
                }
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
                value={activeState.max ?? ""}
                onChange={(e) =>
                  onNumericChange(filter.slug, "max", e.target.value)
                }
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
            value={activeState.values?.[0] ?? ""}
            onChange={(e) => onTextChange(filter.slug, e.target.value)}
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
