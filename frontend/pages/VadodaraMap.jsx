import { FilterPane } from '../components/FilterPane';
import { LeafletMap } from '../components/LeafletMap';
import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';

const VadodaraMap = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [rightPaneOpen, setRightPaneOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [hoveredSector, setHoveredSector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    searchName: '',
    mainCategory: '',
    subCategory: '',
    sector: '',
    ratingOperator: '',
    ratingValue: '',
    valueOperator: '',
    valueValue: ''
  });

  // ---------------- SECTORS ----------------
  const sectors = [
    {id:21,name:"North-Outskirts",coords:[[22.450,72.900],[22.450,73.320],[22.380,73.320],[22.380,72.900]]},
    {id:22,name:"East-Outskirts",coords:[[22.380,73.260],[22.380,73.320],[22.140,73.320],[22.140,73.260]]},
    {id:23,name:"South-Outskirts",coords:[[22.140,72.900],[22.140,73.320],[22.100,73.320],[22.100,72.900]]},
    {id:24,name:"West-Outskirts",coords:[[22.380,72.900],[22.380,73.090],[22.140,73.090],[22.140,72.900]]},
    {id:25,name:"Northwest-Corner",coords:[[22.500,72.850],[22.500,72.900],[22.450,72.900],[22.450,72.850]]},
    {id:26,name:"Northeast-Corner",coords:[[22.500,73.320],[22.500,73.370],[22.450,73.370],[22.450,73.320]]},
    {id:27,name:"Southeast-Corner",coords:[[22.100,73.320],[22.100,73.370],[22.050,73.370],[22.050,73.320]]},
    {id:28,name:"Southwest-Corner",coords:[[22.100,72.850],[22.100,72.900],[22.050,72.900],[22.050,72.850]]},
    {id:1,name:"Sama",coords:[[22.380,73.090],[22.380,73.135],[22.350,73.135],[22.350,73.090]]},
    {id:2,name:"Harni",coords:[[22.380,73.135],[22.380,73.165],[22.350,73.165],[22.350,73.135]]},
    {id:3,name:"Ajwa",coords:[[22.380,73.165],[22.380,73.195],[22.350,73.195],[22.350,73.165]]},
    {id:4,name:"Subhanpura",coords:[[22.380,73.195],[22.380,73.225],[22.350,73.225],[22.350,73.195]]},
    {id:5,name:"Gorwa",coords:[[22.380,73.225],[22.380,73.260],[22.350,73.260],[22.350,73.225]]},
    {id:6,name:"Nizampura",coords:[[22.350,73.090],[22.350,73.135],[22.335,73.135],[22.335,73.090]]},
    {id:7,name:"Fatehgunj",coords:[[22.350,73.135],[22.350,73.165],[22.335,73.165],[22.335,73.135]]},
    {id:8,name:"Raopura-Mandvi",coords:[[22.350,73.165],[22.350,73.195],[22.335,73.195],[22.335,73.165]]},
    {id:9,name:"WaghodiaRd",coords:[[22.350,73.195],[22.350,73.225],[22.335,73.225],[22.335,73.195]]},
    {id:10,name:"ElloraPark",coords:[[22.350,73.225],[22.350,73.260],[22.335,73.260],[22.335,73.225]]},
    {id:11,name:"Karelibaug",coords:[[22.335,73.090],[22.335,73.135],[22.320,73.135],[22.320,73.090]]},
    {id:12,name:"Alkapuri",coords:[[22.335,73.135],[22.335,73.165],[22.320,73.165],[22.320,73.135]]},
    {id:13,name:"Akota",coords:[[22.335,73.165],[22.335,73.195],[22.320,73.195],[22.320,73.165]]},
    {id:14,name:"Gotri",coords:[[22.335,73.195],[22.335,73.225],[22.320,73.225],[22.320,73.195]]},
    {id:15,name:"Vasna-Bhayli",coords:[[22.335,73.225],[22.335,73.260],[22.320,73.260],[22.320,73.225]]},
    {id:16,name:"Manjalpur",coords:[[22.320,73.090],[22.320,73.135],[22.300,73.135],[22.300,73.090]]},
    {id:17,name:"Makarpura",coords:[[22.320,73.135],[22.320,73.165],[22.300,73.165],[22.300,73.135]]},
    {id:18,name:"Tarsali",coords:[[22.320,73.165],[22.320,73.195],[22.300,73.195],[22.300,73.165]]},
    {id:19,name:"PratapNagar",coords:[[22.320,73.195],[22.320,73.225],[22.300,73.225],[22.300,73.195]]},
    {id:20,name:"Atladra",coords:[[22.320,73.225],[22.320,73.260],[22.300,73.260],[22.300,73.225]]}
  ];

  // ---------------- LOAD CSV ----------------
  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/data/vadodara_final.csv');
        if (!response.ok) throw new Error('Failed to load CSV');

        const text = await response.text();
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data
              .map((row) => ({
                osm_id: row.osm_id,
                name: row.name || '',
                lat: parseFloat(row.lat),
                lon: parseFloat(row.lon),
                main_category: row.main_category || '',
                subcategory: row.subcategory || '',
                sector: Number(row.sector) || null,
                intra_class_weight: Number(row.intra_class_weight) || 0,
                inter_class_weights: Number(row.inter_class_weights) || 0,
                value: Number(row.value) || 0
              }))
              .filter((d) => !isNaN(d.lat) && !isNaN(d.lon));

            setData(parsed);
            setFilteredData(parsed);
            setLoading(false);
          },
          error: (err) => {
            setError('CSV parse error: ' + err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadCSV();
  }, []);

  // ---------------- FILTER LOGIC ----------------
  const uniqueCategories = useMemo(
    () => [...new Set(data.map((d) => d.main_category))].filter(Boolean).sort(),
    [data]
  );
  const uniqueSubCategories = useMemo(
    () => [...new Set(data.map((d) => d.subcategory))].filter(Boolean).sort(),
    [data]
  );
  const uniqueSectorNames = useMemo(
    () => [...new Set(data.map((d) => d.sector))].filter(Boolean).sort(),
    [data]
  );

  const searchSuggestions = useMemo(() => {
    if (!filters.searchName || filters.searchName.length < 2) return [];
    const t = filters.searchName.toLowerCase();
    return [...new Set(data.filter((d) => d.name.toLowerCase().includes(t)).map((d) => d.name))].slice(0, 10);
  }, [filters.searchName, data]);

  useEffect(() => {
    let result = [...data];

    if (filters.searchName) {
      const t = filters.searchName.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(t));
    }
    if (filters.mainCategory) result = result.filter((d) => d.main_category === filters.mainCategory);
    if (filters.subCategory) result = result.filter((d) => d.subcategory === filters.subCategory);
    if (filters.sector) result = result.filter((d) => String(d.sector) === String(filters.sector));

    if (filters.ratingOperator && filters.ratingValue !== '') {
      const v = parseFloat(filters.ratingValue);
      if (!isNaN(v)) {
        if (filters.ratingOperator === '>') result = result.filter((d) => d.value > v);
        if (filters.ratingOperator === '<') result = result.filter((d) => d.value < v);
        if (filters.ratingOperator === '=') result = result.filter((d) => Math.abs(d.value - v) < 0.01);
      }
    }

    if (filters.valueOperator && filters.valueValue !== '') {
      const v = parseFloat(filters.valueValue);
      if (!isNaN(v)) {
        if (filters.valueOperator === '>') result = result.filter((d) => d.value > v);
        if (filters.valueOperator === '<') result = result.filter((d) => d.value < v);
        if (filters.valueOperator === '=') result = result.filter((d) => Math.abs(d.value - v) < 0.01);
      }
    }

    setFilteredData(result);
  }, [filters, data]);

  // ---------------- UTILITIES ----------------
  const pointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0];
      const xj = polygon[j][1], yj = polygon[j][0];
      const intersect =
        yi > point[0] !== yj > point[0] &&
        point[1] < ((xj - xi) * (point[0] - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const getSectorDataPoints = (sectorId) => {
    const s = sectors.find((x) => x.id === sectorId);
    if (!s) return [];
    return filteredData.filter((d) => pointInPolygon([d.lat, d.lon], s.coords));
  };

  const getSectorAvgRating = (sectorId) => {
    const pts = getSectorDataPoints(sectorId);
    if (!pts.length) return 0;
    return pts.reduce((a, b) => a + b.value, 0) / pts.length;
  };

  const handleSectorClick = (id) => {
    setSelectedSector(id);
    setSelectedDataPoint(null);
    setRightPaneOpen(true);
  };

  const handleDataPointClick = (p) => {
    setSelectedDataPoint(p);
    setSelectedSector(null);
    setRightPaneOpen(true);
  };

  // ---------------- UI ----------------
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading data...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      <FilterPane
        filters={filters}
        setFilters={setFilters}
        uniqueCategories={uniqueCategories}
        uniqueSubCategories={uniqueSubCategories}
        uniqueSectorNames={uniqueSectorNames}
        searchSuggestions={searchSuggestions}
        filterCollapsed={filterCollapsed}
        setFilterCollapsed={setFilterCollapsed}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <LeafletMap
            filteredData={filteredData}
            sectors={sectors}
            hoveredSector={hoveredSector}
            setHoveredSector={setHoveredSector}
            handleSectorClick={handleSectorClick}
            handleDataPointClick={handleDataPointClick}
            getSectorAvgRating={getSectorAvgRating}
            getSectorDataPoints={getSectorDataPoints}
          />
        </div>

        <RightPane
          rightPaneOpen={rightPaneOpen}
          setRightPaneOpen={setRightPaneOpen}
          selectedDataPoint={selectedDataPoint}
          selectedSector={selectedSector}
          getSectorDataPoints={getSectorDataPoints}
          handleDataPointClick={handleDataPointClick}
        />
      </div>
    </div>
  );
};

export default VadodaraMap;