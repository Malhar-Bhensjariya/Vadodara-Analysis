import React from "react";
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
  searchSuggestions,
  filterCollapsed,
  setFilterCollapsed
}) => {
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

        {!filterCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.searchName}
                onChange={(e) =>
                  setFilters({ ...filters, searchName: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {searchSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                  {searchSuggestions.map((name, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setFilters({ ...filters, searchName: name })
                      }
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Category */}
            <select
              value={filters.mainCategory}
              onChange={(e) =>
                setFilters({ ...filters, mainCategory: e.target.value })
              }
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>

              {MAIN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sub Category */}
            <select
              value={filters.subCategory}
              onChange={(e) =>
                setFilters({ ...filters, subCategory: e.target.value })
              }
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sub-Categories</option>

              {SUB_CATEGORIES.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            {/* Sector */}
            <select
              value={filters.sector}
              onChange={(e) =>
                setFilters({ ...filters, sector: e.target.value })
              }
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sectors</option>

              {uniqueSectorNames.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            {/* Rating filter */}
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

            {/* Value filter */}
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

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({
                  searchName: "",
                  mainCategory: "",
                  subCategory: "",
                  sector: "",
                  ratingOperator: "",
                  ratingValue: "",
                  valueOperator: "",
                  valueValue: "",
                })
              }
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            >
              Clear Filters
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPane;