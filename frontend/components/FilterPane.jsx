import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const MAIN_CATEGORIES = ["poi", "building", "landuse", "road"];

const SUB_CATEGORIES = [
  'hospital', 'bus_station', 'fuel', 'toilets', 'cinema', 'police',
  'cafe', 'school', 'fast_food', 'supermarket', 'place_of_worship',
  'bank', 'atm', 'fire_station', 'confectionery', 'pharmacy',
  'marketplace', 'post_office', 'mobile_phone', 'stationery',
  'clothes', 'restaurant', 'clinic', 'car', 'outdoor', 'hairdresser',
  'theatre', 'travel_agency', 'car_repair', 'bakery', 'water_point',
  'library', 'university', 'college', 'blood_bank', 'doctors',
  'dentist', 'tobacco', 'jewelry', 'computer', 'sports',
  'convenience', 'tea', 'car_wash', 'general', 'furniture', 'dairy',
  'drinking_water', 'prison', 'parking', 'townhall', 'fountain',
  'mall', 'courthouse', 'motorcycle_parking', 'planetarium',
  'events_venue', 'food_court', 'ice_cream', 'taxi',
  'charging_station', 'parking_space', 'community_centre', 'bench',
  'transportation', 'apartments', 'commercial', 'house', 'temple',
  'industrial', 'storage_tank', 'hangar', 'residential', 'mosque',
  'retail', 'airport_terminal', 'train_station', 'roof', 'warehouse',
  'garage', 'pavilion', 'sports_centre', 'stadium',
  'recreation_ground', 'military', 'garden', 'grass', 'landfill',
  'Dump Yard', 'meadow', 'basin', 'religious', 'brownfield',
  'railway', 'construction', 'primary', 'secondary', 'tertiary',
  'service'
];

const FilterPane = ({
  filters,
  setFilters,
  uniqueSectorNames,
  searchSuggestions = [],
  filterCollapsed,
  setFilterCollapsed,
  onApply
}) => {
  const [localSuggestions, setLocalSuggestions] = useState(searchSuggestions || []);
  const [query, setQuery] = useState(filters.searchName || '');
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const API_URL = 'https://api.example.com'; // Replace with your API URL

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleRemoveFilter = (filterType, value = null) => {
    let newFilters;
    
    if (filterType === 'mainCategory' || filterType === 'subCategory' || filterType === 'sector') {
      newFilters = {
        ...filters,
        [filterType]: filters[filterType].filter(item => item !== value)
      };
    } else {
      newFilters = { ...filters, [filterType]: "" };
      if (filterType === 'searchName') {
        setQuery('');
      }
    }
    
    setFilters(newFilters);
    const hasAnyFilter = checkIfAnyFilterActive(newFilters);
    if (typeof onApply === 'function') {
      onApply(newFilters, !hasAnyFilter);
    }
  };

  const handleAddFilter = (filterType, value) => {
    if (!value) return;
    
    let newFilters;
    
    if (filterType === 'mainCategory' || filterType === 'subCategory' || filterType === 'sector') {
      const currentValues = filters[filterType] || [];
      if (!currentValues.includes(value)) {
        newFilters = {
          ...filters,
          [filterType]: [...currentValues, value]
        };
      } else {
        return;
      }
    } else {
      newFilters = { ...filters, [filterType]: value };
    }
    
    setFilters(newFilters);
    const hasAnyFilter = checkIfAnyFilterActive(newFilters);
    if (typeof onApply === 'function') onApply(newFilters, !hasAnyFilter);
  };

  const checkIfAnyFilterActive = (filterObj) => {
    return Object.entries(filterObj).some(([key, value]) => {
      if (key === 'mainCategory' || key === 'subCategory' || key === 'sector') {
        return Array.isArray(value) && value.length > 0;
      } else {
        return value !== "" && value !== null && value !== undefined;
      }
    });
  };

  const handleClearAllFilters = () => {
    const clearedFilters = {
      searchName: "",
      mainCategory: [],
      subCategory: [],
      sector: [],
      ratingOperator: "",
      ratingValue: "",
      valueOperator: "",
      valueValue: "",
    };
    setFilters(clearedFilters);
    setQuery('');
    setLocalSuggestions([]);
    
    if (typeof onApply === 'function') {
      onApply(clearedFilters, true);
    }
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            onClick={() => setFilterCollapsed(!filterCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {filterCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Selected filter tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {filters.searchName && (
            <div className="flex items-center bg-blue-50 text-blue-800 px-2 py-1 rounded text-sm">
              <span className="mr-2">{filters.searchName}</span>
              <button
                onClick={() => handleRemoveFilter('searchName')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
                aria-label="Remove search"
              >
                ×
              </button>
            </div>
          )}

          {filters.mainCategory.map((category, index) => (
            <div key={index} className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              <span className="mr-2">{category}</span>
              <button
                onClick={() => handleRemoveFilter('mainCategory', category)}
                className="text-purple-600 hover:text-purple-800 font-semibold"
                aria-label="Remove main category"
              >
                ×
              </button>
            </div>
          ))}

          {filters.subCategory.map((subCategory, index) => (
            <div key={index} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              <span className="mr-2">{subCategory}</span>
              <button
                onClick={() => handleRemoveFilter('subCategory', subCategory)}
                className="text-green-600 hover:text-green-800 font-semibold"
                aria-label="Remove sub category"
              >
                ×
              </button>
            </div>
          ))}

          {filters.sector.map((sector, index) => (
            <div key={index} className="flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
              <span className="mr-2">Sector: {sector}</span>
              <button
                onClick={() => handleRemoveFilter('sector', sector)}
                className="text-orange-600 hover:text-orange-800 font-semibold"
                aria-label="Remove sector"
              >
                ×
              </button>
            </div>
          ))}

          {filters.ratingValue && filters.ratingOperator && (
            <div className="flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              <span className="mr-2">Rating: {filters.ratingOperator} {filters.ratingValue}</span>
              <button
                onClick={() => {
                  const newFilters = { ...filters, ratingOperator: "", ratingValue: "" };
                  setFilters(newFilters);
                  const hasAnyFilter = checkIfAnyFilterActive(newFilters);
                  if (typeof onApply === 'function') onApply(newFilters, !hasAnyFilter);
                }}
                className="text-gray-600 hover:text-gray-800 font-semibold"
                aria-label="Remove rating filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.valueValue && filters.valueOperator && (
            <div className="flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              <span className="mr-2">Value: {filters.valueOperator} {filters.valueValue}</span>
              <button
                onClick={() => {
                  const newFilters = { ...filters, valueOperator: "", valueValue: "" };
                  setFilters(newFilters);
                  const hasAnyFilter = checkIfAnyFilterActive(newFilters);
                  if (typeof onApply === 'function') onApply(newFilters, !hasAnyFilter);
                }}
                className="text-gray-600 hover:text-gray-800 font-semibold"
                aria-label="Remove value filter"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {!filterCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  if (abortRef.current) {
                    try { abortRef.current.abort(); } catch (e) {}
                    abortRef.current = null;
                  }
                  debounceRef.current = setTimeout(async () => {
                    setFilters({ ...filters, searchName: v });

                    if (!v || v.trim().length < 2) {
                      setLocalSuggestions([]);
                      return;
                    }

                    try {
                      abortRef.current = new AbortController();
                      const resp = await fetch(`${API_URL}/search?q=${encodeURIComponent(v)}&limit=10`, { 
                        signal: abortRef.current.signal 
                      });
                      if (!resp.ok) throw new Error('Suggestion request failed');
                      const j = await resp.json();
                      if (j && j.success && Array.isArray(j.suggestions)) {
                        setLocalSuggestions(j.suggestions.slice(0, 10));
                      } else {
                        setLocalSuggestions([]);
                      }
                    } catch (err) {
                      if (err.name !== 'AbortError') console.warn('Suggestion fetch error', err.message || err);
                      setLocalSuggestions([]);
                    } finally {
                      abortRef.current = null;
                    }
                  }, 300);
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {(localSuggestions || []).length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                  {(localSuggestions || []).map((name, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setQuery(name);
                        const newFilters = { ...filters, searchName: name };
                        setFilters(newFilters);
                        setLocalSuggestions([]);
                        const hasAnyFilter = checkIfAnyFilterActive(newFilters);
                        if (typeof onApply === 'function') onApply(newFilters, !hasAnyFilter);
                      }}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddFilter('mainCategory', e.target.value);
                  e.target.value = "";
                }
              }}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Add Main Category</option>
              {MAIN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} disabled={filters.mainCategory.includes(cat)}>
                  {cat} {filters.mainCategory.includes(cat) ? '✓' : ''}
                </option>
              ))}
            </select>

            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddFilter('subCategory', e.target.value);
                  e.target.value = "";
                }
              }}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Add Sub-Category</option>
              {SUB_CATEGORIES.map((sub) => (
                <option key={sub} value={sub} disabled={filters.subCategory.includes(sub)}>
                  {sub} {filters.subCategory.includes(sub) ? '✓' : ''}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                value={filters.ratingOperator}
                onChange={(e) =>
                  setFilters({ ...filters, ratingOperator: e.target.value })
                }
                className="w-20 px-2 py-2 border rounded"
              >
                <option value="">Op</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
              </select>

              <input
                type="number"
                placeholder="Rating value"
                value={filters.ratingValue}
                onChange={(e) =>
                  setFilters({ ...filters, ratingValue: e.target.value })
                }
                className="flex-1 px-3 py-2 border rounded"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filters.valueOperator}
                onChange={(e) =>
                  setFilters({ ...filters, valueOperator: e.target.value })
                }
                className="w-20 px-2 py-2 border rounded"
              >
                <option value="">Op</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
              </select>

              <input
                type="number"
                placeholder="Data point value"
                value={filters.valueValue}
                onChange={(e) =>
                  setFilters({ ...filters, valueValue: e.target.value })
                }
                className="flex-1 px-3 py-2 border rounded"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                Clear Filters
              </button>

              <button
                onClick={() => {
                  const hasAnyFilter = checkIfAnyFilterActive(filters);
                  if (typeof onApply === 'function') onApply(filters, !hasAnyFilter);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPane;