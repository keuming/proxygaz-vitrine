import { useEffect, useRef, useState } from "react";
import { chargerGoogleMaps } from "../lib/googleMaps";

export interface AdresseChoisie {
  adresse: string;
  latitude: number;
  longitude: number;
}

// Abidjan par défaut, tant que l'utilisateur n'a pas encore choisi de position
const CENTRE_DEFAUT = { lat: 5.336, lng: -4.0267 };

export function AddressPicker({
  valeur,
  onChange,
}: {
  valeur: string;
  onChange: (a: AdresseChoisie) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pret, setPret] = useState(false);
  const [latManuelle, setLatManuelle] = useState(0);
  const [lngManuelle, setLngManuelle] = useState(0);

  useEffect(() => {
    let annule = false;

    chargerGoogleMaps()
      .then(() => {
        if (annule || !inputRef.current || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: CENTRE_DEFAUT,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        });
        mapInstance.current = map;

        const marker = new google.maps.Marker({
          map,
          position: CENTRE_DEFAUT,
          draggable: true,
        });
        markerInstance.current = marker;

        function appliquerPosition(lat: number, lng: number, adresseTexte?: string) {
          map.panTo({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });

          if (adresseTexte) {
            onChange({ adresse: adresseTexte, latitude: lat, longitude: lng });
          } else {
            // Géocodage inverse quand l'utilisateur déplace juste le marqueur
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              const adresseTrouvee =
                status === "OK" && results?.[0] ? results[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
              onChange({ adresse: adresseTrouvee, latitude: lat, longitude: lng });
            });
          }
        }

        // Autocomplétion sur le champ de saisie
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
          fields: ["formatted_address", "geometry", "name"],
          componentRestrictions: { country: "ci" },
        });
        autocomplete.bindTo("bounds", map);

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location) return;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          appliquerPosition(lat, lng, place.formatted_address || place.name);
        });

        // Déplacement manuel du marqueur pour affiner la position
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) appliquerPosition(pos.lat(), pos.lng());
        });

        // Clic sur la carte pour repositionner directement
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) appliquerPosition(e.latLng.lat(), e.latLng.lng());
        });

        setPret(true);
      })
      .catch((e) => setErreur(e.message));

    return () => {
      annule = true;
    };
  }, []);

  if (erreur) {
    // Repli : champ texte + saisie manuelle des coordonnées si la carte ne peut pas se charger
    // (clé API absente ou non configurée pour l'instant)
    return (
      <div>
        <input
          value={valeur}
          onChange={(e) => onChange({ adresse: e.target.value, latitude: latManuelle, longitude: lngManuelle })}
          placeholder="Rue, quartier, commune..."
          className="mb-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-ink/50">Latitude (optionnel)</label>
            <input
              type="number"
              step="any"
              placeholder="5.336"
              value={latManuelle || ""}
              onChange={(e) => {
                const lat = e.target.value ? Number(e.target.value) : 0;
                setLatManuelle(lat);
                onChange({ adresse: valeur, latitude: lat, longitude: lngManuelle });
              }}
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink/50">Longitude (optionnel)</label>
            <input
              type="number"
              step="any"
              placeholder="-4.0267"
              value={lngManuelle || ""}
              onChange={(e) => {
                const lng = e.target.value ? Number(e.target.value) : 0;
                setLngManuelle(lng);
                onChange({ adresse: valeur, latitude: latManuelle, longitude: lng });
              }}
              className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-ink/40">
          Carte indisponible — saisie manuelle. Astuce : clic droit sur l'emplacement dans Google
          Maps pour copier ses coordonnées.
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        defaultValue={valeur}
        placeholder="Rechercher une adresse..."
        className="mb-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-steel-500"
        required
      />
      <div
        ref={mapRef}
        className="h-48 w-full overflow-hidden rounded-md border border-ink/15 bg-ink/5"
      />
      {pret && (
        <p className="mt-1 text-xs text-ink/40">
          Déplacez le repère ou cliquez sur la carte pour affiner l'emplacement exact.
        </p>
      )}
    </div>
  );
}
