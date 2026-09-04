import * as React from "react";
import { Check, ChevronsUpDown, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { locations, popularLocations, type Location } from "@/data/locations";

interface LocationComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LocationCombobox({
  value,
  onValueChange,
  placeholder = "Select location...",
  disabled = false,
  className,
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [customLocation, setCustomLocation] = React.useState("");
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Find the selected location object
  const selectedLocation = value ? locations.find((location) => location.value === value) : null;
  const isCustomLocation = value && !selectedLocation;

  // Filter locations based on search
  const filterLocations = (search: string) => {
    if (!search) return { popular: popularLocations, all: locations };
    
    const searchLower = search.toLowerCase();
    const filtered = locations.filter((location) =>
      location.label.toLowerCase().includes(searchLower) ||
      location.city.toLowerCase().includes(searchLower) ||
      location.country.toLowerCase().includes(searchLower) ||
      location.state.toLowerCase().includes(searchLower)
    );
    
    return {
      popular: popularLocations.filter((location) =>
        location.label.toLowerCase().includes(searchLower)
      ),
      all: filtered
    };
  };

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setShowCustomInput(true);
      setOpen(false);
      return;
    }
    
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    if (customLocation.trim()) {
      onValueChange(customLocation.trim());
      setCustomLocation("");
      setShowCustomInput(false);
    }
  };

  const handleClear = () => {
    onValueChange("");
    setShowCustomInput(false);
    setCustomLocation("");
  };

  const displayValue = selectedLocation?.label || (isCustomLocation ? value : "");

  if (showCustomInput) {
    return (
      <div className={cn("flex gap-2", className)}>
        <Input
          value={customLocation}
          onChange={(e) => setCustomLocation(e.target.value)}
          placeholder="Enter custom location..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCustomSubmit();
            } else if (e.key === "Escape") {
              setShowCustomInput(false);
              setCustomLocation("");
            }
          }}
          autoFocus
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCustomSubmit}
          disabled={!customLocation.trim()}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowCustomInput(false);
            setCustomLocation("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !displayValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {displayValue || placeholder}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {displayValue && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command filter={(value, search) => {
            const { popular, all } = filterLocations(search);
            const allFiltered = [...popular, ...all.filter(loc => !popular.some(p => p.value === loc.value))];
            return allFiltered.some(location => location.value === value) ? 1 : 0;
          }}>
            <CommandInput 
              placeholder="Type to search locations..." 
              className="h-9" 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {!searchValue ? (
                <div className="py-6 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Start typing to search locations</p>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    <div className="py-2 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No locations found.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomInput(true)}
                        className="w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Enter custom location
                      </Button>
                    </div>
                  </CommandEmpty>
                  
                  {filterLocations(searchValue).popular.length > 0 && (
                    <CommandGroup heading="Popular Locations">
                      {filterLocations(searchValue).popular.map((location) => (
                        <CommandItem
                          key={location.value}
                          value={location.value}
                          onSelect={handleSelect}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{location.label}</span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              value === location.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {filterLocations(searchValue).all.filter(location => 
                    !filterLocations(searchValue).popular.some(popular => popular.value === location.value)
                  ).length > 0 && (
                    <CommandGroup heading="All Locations">
                      {filterLocations(searchValue).all
                        .filter(location => !filterLocations(searchValue).popular.some(popular => popular.value === location.value))
                        .map((location) => (
                          <CommandItem
                            key={location.value}
                            value={location.value}
                            onSelect={handleSelect}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{location.label}</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                value === location.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}

                  <CommandGroup>
                    <CommandItem value="custom" onSelect={handleSelect}>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Enter custom location...</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}