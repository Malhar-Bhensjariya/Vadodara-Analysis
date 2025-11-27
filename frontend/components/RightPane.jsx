import { X } from "lucide-react";

const RightPane = ({
  rightPaneOpen,
  setRightPaneOpen,
  selectedDataPoint,
  selectedSector,
  getSectorDataPoints,
  handleDataPointClick
}) => {
  if (!rightPaneOpen) return null;

  const sectorPoints =
    selectedSector && typeof getSectorDataPoints === "function"
      ? getSectorDataPoints(selectedSector) || []
      : [];

  return (
    <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-semibold text-gray-800">
          {selectedDataPoint ? "Data Point Details" : "Sector Data Points"}
        </h3>
        <button
          onClick={() => setRightPaneOpen(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        {/* Data Point Details */}
        {selectedDataPoint && (
          <div className="space-y-2 bg-gray-50 p-3 rounded border">
            <div>
              <span className="font-medium">Name:</span>{" "}
              {selectedDataPoint.name ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Rating:</span>{" "}
              {selectedDataPoint.value?.toFixed(2) ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Lat:</span>{" "}
              {selectedDataPoint.lat?.toFixed(6) ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Lon:</span>{" "}
              {selectedDataPoint.lon?.toFixed(6) ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Category:</span>{" "}
              {selectedDataPoint.main_category ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Sub-Category:</span>{" "}
              {selectedDataPoint.subcategory ?? "N/A"}
            </div>
            <div>
              <span className="font-medium">Sector:</span>{" "}
              {selectedDataPoint.sector ?? "N/A"}
            </div>
          </div>
        )}

        {/* Sector Points Listing */}
        {selectedSector && (
          <div className="space-y-3 mt-2">
            {sectorPoints.map((point) => (
              <div
                key={point.id}
                onClick={() => handleDataPointClick(point)}
                className="p-3 bg-gray-50 rounded hover:bg-blue-50 cursor-pointer border"
              >
                <div className="font-medium text-gray-800">{point.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Rating: {point.value?.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {point.main_category} / {point.subcategory}
                </div>
              </div>
            ))}

            {sectorPoints.length === 0 && (
              <div className="text-sm text-gray-500 text-center">
                No points in this sector.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPane;