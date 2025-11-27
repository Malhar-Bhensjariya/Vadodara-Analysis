// VadodaraMap.jsx - WITHOUT PAGINATION

import FilterPane from '../components/FilterPane';
import LeafletMap from '../components/LeafletMap';
import RightPane from '../components/RightPane';
import { useState, useEffect, useMemo } from 'react';

const VadodaraMap = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [rightPaneOpen, setRightPaneOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [hoveredSector, setHoveredSector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [heatmapData, setHeatmapData] = useState({});

  const [filters, setFilters] = useState({
    searchName: '',
    mainCategory: [],
    subCategory: [],
    sector: [],
    ratingOperator: '',
    ratingValue: '',
    valueOperator: '',
    valueValue: ''
  });
  const [shouldLoad, setShouldLoad] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api';

  // Fetch heatmap data
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const response = await fetch(`${API_URL}/data/heatmap`);
        const result = await response.json();
        
        if (result.success) {
          const heatmap = {};
          result.heatmap.forEach(item => {
            heatmap[item.sector] = item.avgValue;
          });
          setHeatmapData(heatmap);
        }
      } catch (err) {
        console.error('Error fetching heatmap:', err);
      }
    };

    fetchHeatmap();
  }, [API_URL]);

  // Heatmap color function
  const getSectorColor = (sectorId) => {
    const avgValue = heatmapData[sectorId];
    
    if (avgValue === undefined || avgValue === null) return '#e5e7eb';
    
    const values = Object.values(heatmapData).filter(val => val != null);
    if (values.length === 0) return '#e5e7eb';
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    if (minVal === maxVal) return '#ffff00';
    
    const normalized = (avgValue - minVal) / (maxVal - minVal);
    
    let r, g, b;
    
    if (normalized < 0.25) {
      const t = normalized * 4;
      r = 255;
      g = Math.round(0 + (144 * t));
      b = Math.round(0 + (144 * t));
    } else if (normalized < 0.5) {
      const t = (normalized - 0.25) * 4;
      r = 255;
      g = Math.round(144 + (111 * t));
      b = Math.round(144 * (1 - t));
    } else if (normalized < 0.75) {
      const t = (normalized - 0.5) * 4;
      r = Math.round(255 * (1 - t));
      g = 255;
      b = 0;
    } else {
      const t = (normalized - 0.75) * 4;
      r = 0;
      g = 255;
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Sectors data
  const sectors = [
    {id:1,name:"Nizampura",coords:[[22.345408,73.189611],[22.345408,73.215260],[22.323408,73.215260],[22.323408,73.189611]]},
    {id:2,name:"Laxmipura",coords:[[22.345408,73.165942],[22.345408,73.189611],[22.323408,73.189611],[22.323408,73.165942]]},
    {id:3,name:"Fategunj",coords:[[22.323408,73.182120],[22.323408,73.215260],[22.313097,73.215260],[22.313097,73.182120]]},
    {id:4,name:"Mandvi",coords:[[22.313097,73.207463],[22.313097,73.215260],[22.294040,73.215260],[22.294040,73.207463]]},
    {id:5,name:"Alkapuri",coords:[[22.323408,73.162120],[22.323408,73.182120],[22.301657,73.182120],[22.301657,73.162120]]},
    {id:6,name:"Gotri",coords:[[22.323408,73.125906],[22.323408,73.162120],[22.301657,73.162120],[22.301657,73.125906]]},
    {id:7,name:"Gorwa",coords:[[22.345408,73.125942],[22.345408,73.165942],[22.323408,73.165942],[22.323408,73.125942]]},
    {id:8,name:"Akota",coords:[[22.301657,73.162120],[22.301657,73.182120],[22.285657,73.182120],[22.285657,73.162120]]},
    {id:9,name:"Vasna",coords:[[22.301657,73.142120],[22.301657,73.162120],[22.285657,73.162120],[22.285657,73.142120]]},
    {id:10,name:"Bhayli",coords:[[22.301657,73.110120],[22.301657,73.142120],[22.285657,73.142120],[22.285657,73.110120]]},
    {id:11,name:"Manjalpur",coords:[[22.285657,73.177265],[22.285657,73.207463],[22.257364,73.207463],[22.257364,73.177265]]},
    {id:12,name:"Makarpura",coords:[[22.257364,73.177265],[22.257364,73.207463],[22.230307,73.207463],[22.230307,73.177265]]},
    {id:13,name:"Tarsali",coords:[[22.270523,73.207463],[22.270523,73.28000],[22.230307,73.28000],[22.230307,73.207463]]},
    {id:15,name:"Ajwa",coords:[[22.313097,73.182120],[22.313097,73.207463],[22.285657,73.207463],[22.285657,73.182120]]},
    {id:16,name:"Pratapnagar",coords:[[22.294040,73.207463],[22.294040,73.215260],[22.270523,73.215260],[22.270523,73.207463]]},
    {id:17,name:"Vadodara East Taluka",coords:[[22.345408,73.215260],[22.345408,73.280000],[22.270523,73.280000],[22.270523,73.215260]]},
    {id:19,name:"North-West Taluka",coords:[[22.345000,73.020000],[22.345000,73.125906],[22.301657,73.125906],[22.301657,73.020000]]},
    {id:20,name:"West Taluka",coords:[[22.301657,73.020000],[22.301657,73.110120],[22.230000,73.110120],[22.230000,73.020000]]},
    {id:22,name:"South Taluka",coords:[[22.230307,73.020000],[22.230307,73.280000],[22.100000,73.280000],[22.100000,73.020000]]},
    {id:23,name:"North Taluka",coords:[[22.380000,73.020000],[22.380000,73.280000],[22.345408,73.280000],[22.345408,73.020000]]},
    {id:24,name:"Atladra",coords:[[22.285657,73.110120],[22.285657,73.177265],[22.230000,73.177265],[22.230000,73.110120]]},
    {id:25,name:"Waghodia",coords:[[22.380000,73.280000],[22.380000,73.500000],[22.270523,73.500000],[22.270523,73.280000]]},
  ];

  // Load data with filters - NO PAGINATION
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Build URLSearchParams with array support
        const params = new URLSearchParams();
        
        // Remove pagination params - fetch all data
        params.append('limit', '10000'); // Set high limit to get all data
        
        if (filters.searchName) {
          params.append('searchName', filters.searchName);
        }
        
        if (filters.ratingOperator && filters.ratingValue) {
          params.append('ratingOp', filters.ratingOperator);
          params.append('ratingVal', filters.ratingValue);
        }
        
        if (filters.valueOperator && filters.valueValue) {
          params.append('valueOp', filters.valueOperator);
          params.append('valueVal', filters.valueValue);
        }

        // Add array filters
        filters.mainCategory.forEach(cat => params.append('mainCategory', cat));
        filters.subCategory.forEach(sub => params.append('subCategory', sub));
        filters.sector.forEach(sec => params.append('sector', sec));

        if (!shouldLoad) {
          setLoading(false);
          return;
        }

        console.log('Fetching data with filters', filters);
        console.log('Query string:', params.toString());

        const response = await fetch(`${API_URL}/data?${params}`);
        if (!response.ok) throw new Error('Failed to load data');

        const result = await response.json();
        console.log('Loaded data points:', result.data.length, 'Total:', result.pagination.total);

        setData(result.data);
        setFilteredData(result.data);
        setLoading(false);
      } catch (err) {
        console.error('Load error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (!shouldLoad) return;
      loadData();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, shouldLoad, API_URL]);

  // Memoized data calculations
  const uniqueCategories = useMemo(() => {
    return [...new Set(data.map((d) => d.main_category))].filter(Boolean).sort();
  }, [data]);

  const uniqueSubCategories = useMemo(() => {
    return [...new Set(data.map((d) => d.subcategory))].filter(Boolean).sort();
  }, [data]);

  const uniqueSectorNames = useMemo(() => {
    return [...new Set(data.map((d) => d.sector))].filter(Boolean).sort();
  }, [data]);

  const searchSuggestions = useMemo(() => {
    if (!filters.searchName || filters.searchName.length < 2) return [];
    const t = filters.searchName.toLowerCase();
    return [...new Set(data.filter((d) => d.name && d.name.toLowerCase().includes(t)).map((d) => d.name))].slice(0, 10);
  }, [filters.searchName, data]);

  // Utility functions
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <FilterPane
        filters={filters}
        setFilters={setFilters}
        uniqueSectorNames={uniqueSectorNames}
        searchSuggestions={searchSuggestions}
        filterCollapsed={filterCollapsed}
        setFilterCollapsed={setFilterCollapsed}
        onApply={(appliedFilters, isClearAll = false) => {
          setFilters(appliedFilters);
          
          const hasAnyFilter = Object.entries(appliedFilters).some(([key, value]) => {
            if (key === 'mainCategory' || key === 'subCategory' || key === 'sector') {
              return Array.isArray(value) && value.length > 0;
            } else {
              return value !== "" && value !== null && value !== undefined;
            }
          });
          
          if (isClearAll || !hasAnyFilter) {
            setShouldLoad(false);
            setData([]);
            setFilteredData([]);
            setRightPaneOpen(false);
            setSelectedSector(null);
            setSelectedDataPoint(null);
          } else {
            setShouldLoad(true);
          }
        }}
      />

      {loading && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-700">
          Loading data... ({filteredData.length} points loaded)
        </div>
      )}

      {!shouldLoad && !loading && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-700">
          No filters applied. Please apply filters to view data points on the map.
        </div>
      )}

      {shouldLoad && !loading && filteredData.length > 0 && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-700">
          Showing {filteredData.length} data points
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 relative min-w-0">
          <LeafletMap
            filteredData={filteredData}
            filters={filters}
            enabled={shouldLoad}
            sectors={sectors}
            hoveredSector={hoveredSector}
            setHoveredSector={setHoveredSector}
            handleSectorClick={handleSectorClick}
            handleDataPointClick={handleDataPointClick}
            getSectorAvgRating={getSectorAvgRating}
            getSectorDataPoints={getSectorDataPoints}
            getSectorColor={getSectorColor}
            heatmapData={heatmapData}
          />
        </div>

        {rightPaneOpen && (
          <RightPane
            rightPaneOpen={rightPaneOpen}
            setRightPaneOpen={setRightPaneOpen}
            selectedDataPoint={selectedDataPoint}
            selectedSector={selectedSector}
            getSectorDataPoints={getSectorDataPoints}
            handleDataPointClick={handleDataPointClick}
          />
        )}
      </div>
    </div>
  );
};

export default VadodaraMap;