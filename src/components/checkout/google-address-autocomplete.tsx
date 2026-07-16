"use client";

import { useEffect, useRef } from "react";
type GooglePlace = {
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address?: string;
};

type GoogleAutocomplete = {
  addListener: (eventName: "place_changed", callback: () => void) => void;
  getPlace: () => GooglePlace;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: {
              componentRestrictions: { country: string };
              fields: string[];
            }
          ) => GoogleAutocomplete;
        };
      };
    };
  }
}

export function GoogleAddressAutocomplete({ onPlace }: { onPlace: (place: GooglePlace) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey || !inputRef.current) return;
    const scriptId = "google-maps-places";
    const setup = () => {
      if (!window.google?.maps?.places || !inputRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["address_components", "formatted_address"]
      });
      autocomplete.addListener("place_changed", () => onPlace(autocomplete.getPlace()));
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.onload = setup;
      document.head.appendChild(script);
    } else {
      setup();
    }
  }, [onPlace]);

  return (
    <input
      ref={inputRef}
      className="focus-ring h-11 w-full rounded-md border bg-white/80 px-3 py-2 text-sm shadow-sm"
      placeholder="Search address"
      type="text"
      autoComplete="street-address"
    />
  );
}
