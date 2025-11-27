// LeafletMap.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Hospital, Bus, Fuel, Droplet, Film, Shield, Coffee,
  School, Pizza, ShoppingCart, Church, Building, CreditCard,
  Flame, Candy, Cross, Store, Mail, Smartphone, FileText, Shirt,
  UtensilsCrossed, Stethoscope, Car, TreePine, Scissors, Theater,
  Plane, Wrench, Croissant, BookOpen, GraduationCap, Heart,
  User, Cigarette, Gem, Monitor, Dumbbell, Package, Milk,
  Droplets, Lock, MapPin, Landmark, IceCream,
  Battery, Users, Armchair, Building2, Box, Container,
  Tent, Home, Factory, ShoppingBag, Train, Zap,
  Goal, Trophy, Swords, Trees, Trash, Mountain, Compass, HardHat,
  Navigation
} from "lucide-react";


// ------------------------------------------------------------
// ICON MAP
// ------------------------------------------------------------
const iconMap = {
  hospital: Hospital,
  bus_station: Bus,
  fuel: Fuel,
  toilets: Droplet,
  cinema: Film,
  police: Shield,
  cafe: Coffee,
  school: School,
  fast_food: Pizza,
  supermarket: ShoppingCart,
  place_of_worship: Church,
  bank: Building,
  atm: CreditCard,
  fire_station: Flame,
  confectionery: Candy,
  pharmacy: Cross,
  marketplace: Store,
  post_office: Mail,
  mobile_phone: Smartphone,
  stationery: FileText,
  clothes: Shirt,
  restaurant: UtensilsCrossed,
  clinic: Stethoscope,
  car: Car,
  outdoor: TreePine,
  hairdresser: Scissors,
  theatre: Theater,
  travel_agency: Plane,
  car_repair: Wrench,
  bakery: Croissant,
  water_point: Droplet,
  library: BookOpen,
  university: GraduationCap,
  college: GraduationCap,
  blood_bank: Heart,
  doctors: User,
  dentist: User,
  tobacco: Cigarette,
  jewelry: Gem,
  computer: Monitor,
  sports: Dumbbell,
  convenience: Package,
  tea: Coffee,
  car_wash: Droplet,
  general: Store,
  furniture: Armchair,
  dairy: Milk,
  drinking_water: Droplets,
  prison: Lock,
  parking: MapPin,
  townhall: Landmark,
  fountain: Droplet,
  mall: ShoppingBag,
  courthouse: Landmark,
  motorcycle_parking: MapPin,
  planetarium: MapPin,
  events_venue: MapPin,
  food_court: UtensilsCrossed,
  ice_cream: IceCream,
  taxi: Car,
  charging_station: Battery,
  parking_space: MapPin,
  community_centre: Users,
  bench: Armchair,
  transportation: Bus,
  apartments: Building2,
  commercial: Building,
  house: Home,
  temple: Church,
  industrial: Factory,
  storage_tank: Container,
  hangar: Tent,
  residential: Home,
  mosque: Church,
  retail: Store,
  airport_terminal: Plane,
  train_station: Train,
  roof: Home,
  warehouse: Box,
  garage: Box,
  pavilion: Tent,
  sports_centre: Goal,
  stadium: Trophy,
  recreation_ground: Trees,
  military: Swords,
  garden: Trees,
  grass: TreePine,
  landfill: Trash,
  "dump yard": Trash,
  meadow: Mountain,
  basin: Droplet,
  religious: Church,
  brownfield: Mountain,
  railway: Train,
  construction: HardHat,
  primary: Navigation,
  secondary: Navigation,
  tertiary: Navigation,
  service: Navigation
};


// ------------------------------------------------------------
// COLOR MAP
// ------------------------------------------------------------
const colorMap = {
  hospital: "#ef4444", clinic: "#ef4444", pharmacy: "#ef4444",
  doctors: "#ef4444", dentist: "#ef4444", blood_bank: "#dc2626",
  school: "#3b82f6", university: "#2563eb", college: "#1d4ed8",
  library: "#60a5fa",
  police: "#1e40af", fire_station: "#f59e0b",
  bank: "#10b981", atm: "#059669",
  restaurant: "#f97316", cafe: "#fb923c", fast_food: "#fdba74",
  bakery: "#fbbf24",
  supermarket: "#8b5cf6", mall: "#7c3aed", marketplace: "#a78bfa",
  fuel: "#eab308",
  parking: "#6b7280",
  place_of_worship: "#ec4899", temple: "#ec4899", mosque: "#ec4899",
};

const getColor = (subcategory) =>
  colorMap[subcategory] || "#6366f1";


// ------------------------------------------------------------
// LABEL MAP
// ------------------------------------------------------------
const getDisplayLabel = (subcategory) => {
  if (["primary", "secondary", "tertiary", "service"].includes(subcategory))
    return "road";

  if (!subcategory || subcategory === "None")
    return "building";

  return subcategory;
};


// ------------------------------------------------------------
// ICON SVG PATH HELPER
// ------------------------------------------------------------
const getIconPath = (subcategory) => {
  const paths = {
    hospital: '<path d="M12 6v12m-6-6h12"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    bus_station: '<path d="M8 6v6m8-6v6M6 2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm13 18-3-3m-8 0-3 3"/>',
    fuel: '<path d="M3 22h12M4 9h10M19 17V3c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v14"/><path d="M18 5h-2m8 10-2.5-2.5M22 13v4c0 .6-.4 1-1 1h-1"/>',
    cafe: '<path d="M17 8h1a4 4 0 1 1 0 8h-1m-14-8h12v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>',
    school: '<path d="m4 6 8-4 8 4M6 10v10m12-10v10M2 22h20"/><path d="M18 14l-4-4-4 4"/>',
    fast_food: '<path d="M17 11h4a3 3 0 0 0 0-6h-3v2m-8 4h.01M11 11v11M11 11a5 5 0 0 1 10 0v11H11z"/>',
    supermarket: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    place_of_worship: '<path d="m4 21 8-7 8 7M4 21v-8l8-4 8 4v8M12 2v7"/>',
    bank: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    atm: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
    police: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    fire_station: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    pharmacy: '<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>',
    restaurant: '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8M15 15l3.3-3.3a3 3 0 0 0 0-4.2L16.5 5.7a3 3 0 0 0-4.2 0L9 9M2 22l5-5M8.5 8.5l7 7"/>',
    parking: '<circle cx="12" cy="12" r="10"/><path d="M9 17V7h4a3 3 0 0 1 0 6h-4"/>',
    library: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    university: '<path d="M4 10h16M12 2v8m-6 0 6-6 6 6M5 14v8h3v-6h8v6h3v-8"/>',
    mall: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    train_station: '<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16M12 3v8m-4 4h.01M16 15h.01M8 19l-2 3m12-3 2 3"/>',
    airport_terminal: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    // Default fallback
    default: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4h8"/>'
  };
  
  return paths[subcategory] || paths.default;
};


// ------------------------------------------------------------
// LEAFLET MAP COMPONENT
// ------------------------------------------------------------
const LeafletMap = ({
  filters = {},
  enabled = true,
  sectors,
  hoveredSector,
  setHoveredSector,
  handleSectorClick,
  handleDataPointClick,
  getSectorAvgRating,
  getSectorDataPoints,
  getSectorColor,
  heatmapData 
}) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const layersRef = useRef({ sectors: [], markers: [] });
  const debugLayersRef = useRef([]);
  const fetchDebounceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  console.log('LeafletMap filters:', filters);


  // INIT MAP
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    if (!window.L) {
      console.error('Leaflet not loaded');
      return;
    }

    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [22.3072, 73.1812],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    leafletMapRef.current = map;
    console.log('Leaflet map initialized');
    // Ensure Leaflet recalculates sizes and positions after mount to avoid small overlay offsets
    map.whenReady(() => {
      setTimeout(() => {
        try { map.invalidateSize(true); } catch (e) { /* ignore */ }
      }, 200);
    });

    // Recompute size on window resize to keep layers aligned
    const onResize = () => {
      try { map.invalidateSize(); } catch (e) { /* ignore */ }
    };
    window.addEventListener('resize', onResize);

    return () => {
      map.remove();
      leafletMapRef.current = null;
      window.removeEventListener('resize', onResize);
    };
  }, []);


  // DRAW SECTORS + MARKERS
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const L = window.L;
    const map = leafletMapRef.current;

    // Clear old layers
    layersRef.current.sectors.forEach(l => map.removeLayer(l));
    layersRef.current.markers.forEach(l => map.removeLayer(l));
    layersRef.current = { sectors: [], markers: [] };

    // ---- Draw sectors ----
    sectors.forEach((sector) => {
      const isDimmed = hoveredSector && hoveredSector !== sector.id;
      const isHighlighted = hoveredSector === sector.id;

      // ensure polygon coords are correct and closed
      const polyCoords = sector.coords.slice();
      const first = polyCoords[0];
      const last = polyCoords[polyCoords.length - 1];
      if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
        polyCoords.push([first[0], first[1]]);
      }

      // Get heatmap color for this sector
      const heatColor = getSectorColor ? getSectorColor(sector.id) : "#e5e7eb";

      const polygon = L.polygon(polyCoords, {
        color: isHighlighted ? "#000" : "#666",
        weight: isHighlighted ? 3 : 1,
        fillColor: isHighlighted ? "#3b82f6" : heatColor,  // Use heatmap color
        fillOpacity: isDimmed ? 0.3 : isHighlighted ? 0.7 : 0.6
      });

      polygon.on("mouseover", () => setHoveredSector(sector.id));
      polygon.on("mouseout", () => setHoveredSector(null));
      polygon.on("click", () => handleSectorClick(sector.id));

      polygon.addTo(map);
      layersRef.current.sectors.push(polygon);
    });

    // draw debug centroids/labels if enabled
    debugLayersRef.current.forEach(l => map.removeLayer(l));
    debugLayersRef.current = [];
    if (debugMode) {
      sectors.forEach(sector => {
        const coords = sector.coords;
        if (!coords || !coords.length) return;
        // simple centroid
        const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const lon = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        const m = L.circleMarker([lat, lon], { radius: 6, color: '#ff0000', weight: 1, fillOpacity: 0.8 }).addTo(map);
        m.bindTooltip(`${sector.name} (id:${sector.id})\n${lat.toFixed(6)}, ${lon.toFixed(6)}`, { permanent: true, direction: 'center', className: 'text-xs bg-white p-1' });
        debugLayersRef.current.push(m);
      });
    }

    // Markers are loaded via viewport requests (see map move handler) — nothing to draw here by default
  }, [sectors, hoveredSector, debugMode, getSectorColor, heatmapData]);

  // Fetch viewport data when map moves/zoom changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;
    const L = window.L;

    const fetchForViewport = () => {
      if (!enabled) return; // do nothing until enabled by parent (user clicked Apply)
      if (!map) return;
      const bounds = map.getBounds();
      const minLat = bounds.getSouth();
      const maxLat = bounds.getNorth();
      const minLon = bounds.getWest();
      const maxLon = bounds.getEast();

      // Debounce network requests
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      fetchDebounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams({
            minLat: String(minLat),
            maxLat: String(maxLat),
            minLon: String(minLon),
            maxLon: String(maxLon),
            limit: '1000'
          });

          // Include ALL filters properly
          if (filters) {
            // Handle search name
            if (filters.searchName) {
              params.append('searchName', filters.searchName);
            }
            
            // Handle array filters
            if (Array.isArray(filters.mainCategory) && filters.mainCategory.length > 0) {
              filters.mainCategory.forEach(cat => params.append('mainCategory', cat));
            }
            
            if (Array.isArray(filters.subCategory) && filters.subCategory.length > 0) {
              filters.subCategory.forEach(sub => params.append('subCategory', sub));
            }
            
            if (Array.isArray(filters.sector) && filters.sector.length > 0) {
              filters.sector.forEach(sec => params.append('sector', String(sec)));
            }
            
            // Handle rating filters
            if (filters.ratingOperator && filters.ratingValue) {
              params.append('ratingOp', filters.ratingOperator);
              params.append('ratingVal', filters.ratingValue);
            }
            
            // Handle value filters
            if (filters.valueOperator && filters.valueValue) {
              params.append('valueOp', filters.valueOperator);
              params.append('valueVal', filters.valueValue);
            }
          }

          console.log('Fetching viewport data with params:', params.toString());

          const res = await fetch(`${API_URL}/data/bounds?${params.toString()}`);
          const json = await res.json();
          console.log('Viewport API response:', json);
          const points = (json && json.data) || [];
          console.log('Points to render:', points.length);

          // Clear existing markers
          layersRef.current.markers.forEach(l => map.removeLayer(l));
          layersRef.current.markers = [];

          // create markers with Lucide icons
          const zoom = map.getZoom();
          // Icon size based on zoom
          const iconSize = Math.max(20, Math.min(32, 36 - zoom * 1.5));

          points.forEach(point => {
            const color = getColor(point.subcategory);
            
            // Create icon HTML using SVG path
            const iconHtml = `
              <div style="
                width: ${iconSize}px; 
                height: ${iconSize}px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                background: ${color};
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="${iconSize * 0.55}" 
                  height="${iconSize * 0.55}" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  ${getIconPath(point.subcategory)}
                </svg>
              </div>
            `;

            const icon = L.divIcon({
              html: iconHtml,
              className: 'custom-marker-icon',
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize / 2]
            });

            const marker = L.marker([point.lat, point.lon], { icon });
            marker.bindTooltip(`<strong>${point.name}</strong><br/>${point.subcategory || ''} — Rating: ${Number(point.value || 0).toFixed(1)}`);
            marker.on('click', () => handleDataPointClick(point));
            marker.addTo(map);
            layersRef.current.markers.push(marker);
          });

          setLoading(false);
        } catch (err) {
          console.error('Viewport fetch error', err);
          setLoading(false);
        }
      }, 250);
    };

    map.on('moveend', fetchForViewport);
    map.on('zoomend', fetchForViewport);

    // initial fetch
    fetchForViewport();

    return () => {
      map.off('moveend', fetchForViewport);
      map.off('zoomend', fetchForViewport);
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
    };
  }, [filters, handleDataPointClick, enabled, API_URL]);


  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Debug toggle button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setDebugMode(d => !d)}
          className="bg-white/90 border rounded px-2 py-1 text-xs shadow"
        >
          {debugMode ? 'Hide' : 'Show'} Grid Debug
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white/80 dark:bg-gray-900/60 rounded-md px-4 py-2 flex items-center gap-3 shadow">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-sm text-gray-700">Loading map points…</div>
          </div>
        </div>
      )}

      {hoveredSector && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg border z-1000">
          <div className="font-semibold">
            {sectors.find(s => s.id === hoveredSector)?.name}
          </div>
          <div className="text-sm text-gray-600">
            Avg Rating: {getSectorAvgRating(hoveredSector).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            Heatmap Value: {heatmapData && heatmapData[hoveredSector] ? heatmapData[hoveredSector].toFixed(2) : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {getSectorDataPoints(hoveredSector).length} data points
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;