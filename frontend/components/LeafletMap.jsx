// LeafletMap.jsx
import React, { useEffect, useRef } from "react";
import {
  Hospital, Bus, Fuel, WashingMachine, Film, Shield, Coffee,
  School, Pizza, ShoppingCart, Church, Building, CreditCard,
  Flame, Candy, Cross, Store, Mail, Smartphone, FileText, Shirt,
  UtensilsCrossed, Stethoscope, Car, TreePine, Scissors, Theater,
  Plane, Wrench, Croissant, Droplet, BookOpen, GraduationCap, Heart,
  UserRound, Cigarette, Gem, Monitor, Dumbbell, Package, Milk,
  GlassWater, Lock, ParkingCircle, Landmark, IceCream, Taxi,
  BatteryCharging, Users, Armchair, Building2, Warehouse, Container,
  Tent, Home, Factory, ShoppingBag, Train, Box, Mosque, PlaneTakeoff,
  Goal, Trophy, Swords, Trees, Trash, Mountain, MapPin, HardHat,
  Route, Navigation
} from "lucide-react";


// ------------------------------------------------------------
// ICON MAP
// ------------------------------------------------------------
const iconMap = {
  hospital: Hospital,
  bus_station: Bus,
  fuel: Fuel,
  toilets: WashingMachine,
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
  doctors: UserRound,
  dentist: UserRound,
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
  drinking_water: GlassWater,
  prison: Lock,
  parking: ParkingCircle,
  townhall: Landmark,
  fountain: Droplet,
  mall: ShoppingBag,
  courthouse: Landmark,
  motorcycle_parking: ParkingCircle,
  planetarium: MapPin,
  events_venue: MapPin,
  food_court: UtensilsCrossed,
  ice_cream: IceCream,
  taxi: Taxi,
  charging_station: BatteryCharging,
  parking_space: ParkingCircle,
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
  mosque: Mosque,
  retail: Store,
  airport_terminal: PlaneTakeoff,
  train_station: Train,
  roof: Home,
  warehouse: Box,
  garage: Warehouse,
  pavilion: Tent,
  sports_centre: Trophy,
  stadium: Goal,
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
  primary: Route,
  secondary: Route,
  tertiary: Route,
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
// LEAFLET MAP COMPONENT
// ------------------------------------------------------------
const LeafletMap = ({
  filteredData,
  sectors,
  hoveredSector,
  setHoveredSector,
  handleSectorClick,
  handleDataPointClick,
  getSectorAvgRating,
  getSectorDataPoints
}) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const layersRef = useRef({ sectors: [], markers: [] });


  // INIT MAP
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

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

    return () => {
      map.remove();
      leafletMapRef.current = null;
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

      const polygon = L.polygon(sector.coords, {
        color: "#6b7280",
        weight: 1,
        fillColor: isHighlighted ? "#3b82f6" : "#e5e7eb",
        fillOpacity: isDimmed ? 0.25 : isHighlighted ? 0.8 : 0.5
      });

      polygon.on("mouseover", () => setHoveredSector(sector.id));
      polygon.on("mouseout", () => setHoveredSector(null));
      polygon.on("click", () => handleSectorClick(sector.id));

      polygon.addTo(map);
      layersRef.current.sectors.push(polygon);
    });


    // ---- Draw markers ----
    filteredData.forEach((point) => {
      const IconComponent = iconMap[point.subcategory] || Building2;
      const color = getColor(point.subcategory);
      const label = getDisplayLabel(point.subcategory);

      // Smaller icon (18px)
      const iconSize = 18;

      const svgMarkup = `
        <svg width="${iconSize - 4}" height="${iconSize - 4}" 
          viewBox="0 0 24 24" fill="none" stroke="white" 
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${React.createElement(IconComponent, { size: iconSize - 4 }).props.children}
        </svg>
      `;

      const html = `
        <div style="
          width:${iconSize}px;
          height:${iconSize}px;
          background:${color};
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          border:1px solid white;
        ">${svgMarkup}</div>
      `;

      const customIcon = L.divIcon({
        html,
        className: "custom-marker",
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
      });

      const marker = L.marker([point.lat, point.lon], { icon: customIcon });

      marker.bindTooltip(
        `<strong>${point.name}</strong><br/>${label} — Rating: ${point.value.toFixed(1)}`,
        { direction: "top", offset: [0, -10] }
      );

      marker.on("click", () => handleDataPointClick(point));

      marker.addTo(map);
      layersRef.current.markers.push(marker);
    });

  }, [filteredData, sectors, hoveredSector]);


  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {hoveredSector && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg border z-1000">
          <div className="font-semibold">
            {sectors.find(s => s.id === hoveredSector)?.name}
          </div>
          <div className="text-sm text-gray-600">
            Avg Rating: {getSectorAvgRating(hoveredSector).toFixed(2)}
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
