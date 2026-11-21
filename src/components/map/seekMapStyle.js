/**
 * Seek basemap: a calm, always-light MapLibre style on OpenFreeMap vector tiles
 * (OpenMapTiles schema, free, no key, commercial use OK). Plain JSON-able object
 * so the mobile app can reuse the same colours and layers.
 */

export const seekMapColors = {
	land: "#F7F6F3",
	green: "#E2EDD9",
	water: "#CDE3F1",
	waterLabel: "#7E9FB6",
	building: "#ECEAE5",
	road: "#FFFFFF",
	roadCasing: "#E4E2DD",
	label: "#717171",
	halo: "#FFFFFF"
};

const c = seekMapColors;
const name = ["coalesce", ["get", "name_en"], ["get", "name"]];
const isLine = ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false];
const isArea = ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false];
const classIn = (...classes) => ["match", ["get", "class"], classes, true, false];
const widths = (stops) => ["interpolate", ["exponential", 1.5], ["zoom"], ...stops.flat()];

const MINOR = classIn("minor", "service");
const MAJOR = classIn("motorway", "trunk", "primary", "secondary", "tertiary");
const textPaint = { "text-color": c.label, "text-halo-color": c.halo, "text-halo-width": 1.4 };

export const seekMapStyle = {
	version: 8,
	name: "Seek",
	glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
	sources: {
		openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" }
	},
	layers: [
		{ id: "land", type: "background", paint: { "background-color": c.land } },
		{
			id: "green",
			type: "fill",
			source: "openmaptiles",
			"source-layer": "landcover",
			filter: classIn("grass", "wood", "farmland"),
			paint: { "fill-color": c.green, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 12, 1] }
		},
		{
			id: "park",
			type: "fill",
			source: "openmaptiles",
			"source-layer": "park",
			filter: isArea,
			paint: { "fill-color": c.green }
		},
		{
			id: "green-landuse",
			type: "fill",
			source: "openmaptiles",
			"source-layer": "landuse",
			filter: classIn("cemetery", "pitch", "playground", "stadium"),
			paint: { "fill-color": c.green }
		},
		{
			id: "water",
			type: "fill",
			source: "openmaptiles",
			"source-layer": "water",
			filter: ["all", isArea, ["!=", ["get", "brunnel"], "tunnel"]],
			paint: { "fill-color": c.water }
		},
		{
			id: "waterway",
			type: "line",
			source: "openmaptiles",
			"source-layer": "waterway",
			filter: isLine,
			paint: { "line-color": c.water, "line-width": widths([[10, 0.5], [16, 3]]) }
		},
		{
			id: "building",
			type: "fill",
			source: "openmaptiles",
			"source-layer": "building",
			minzoom: 14,
			paint: { "fill-color": c.building, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 16, 0.7] }
		},
		{
			id: "road-minor-casing",
			type: "line",
			source: "openmaptiles",
			"source-layer": "transportation",
			minzoom: 12,
			filter: ["all", isLine, MINOR],
			layout: { "line-cap": "round", "line-join": "round" },
			paint: { "line-color": c.roadCasing, "line-width": widths([[12, 1], [14, 3.5], [16, 8], [18, 18], [20, 36]]) }
		},
		{
			id: "road-major-casing",
			type: "line",
			source: "openmaptiles",
			"source-layer": "transportation",
			minzoom: 6,
			filter: ["all", isLine, MAJOR],
			layout: { "line-cap": "round", "line-join": "round" },
			paint: { "line-color": c.roadCasing, "line-width": widths([[8, 1], [12, 3], [14, 6], [16, 11], [18, 24], [20, 46]]) }
		},
		{
			id: "road-minor",
			type: "line",
			source: "openmaptiles",
			"source-layer": "transportation",
			minzoom: 12,
			filter: ["all", isLine, MINOR],
			layout: { "line-cap": "round", "line-join": "round" },
			paint: { "line-color": c.road, "line-width": widths([[12, 0.5], [14, 2.2], [16, 6], [18, 15], [20, 32]]) }
		},
		{
			id: "road-major",
			type: "line",
			source: "openmaptiles",
			"source-layer": "transportation",
			minzoom: 6,
			filter: ["all", isLine, MAJOR],
			layout: { "line-cap": "round", "line-join": "round" },
			paint: { "line-color": c.road, "line-width": widths([[8, 0.6], [12, 2], [14, 4.5], [16, 9], [18, 21], [20, 42]]) }
		},
		{
			id: "water-name",
			type: "symbol",
			source: "openmaptiles",
			"source-layer": "water_name",
			layout: { "text-field": name, "text-font": ["Noto Sans Italic"], "text-size": 12, "text-max-width": 8 },
			paint: { "text-color": c.waterLabel, "text-halo-color": c.halo, "text-halo-width": 1 }
		},
		{
			id: "road-name",
			type: "symbol",
			source: "openmaptiles",
			"source-layer": "transportation_name",
			minzoom: 14,
			filter: classIn("minor", "primary", "secondary", "tertiary", "trunk"),
			layout: {
				"symbol-placement": "line",
				"text-field": name,
				"text-font": ["Noto Sans Regular"],
				"text-size": ["interpolate", ["linear"], ["zoom"], 14, 10.5, 17, 12.5],
				"text-rotation-alignment": "map"
			},
			paint: textPaint
		},
		{
			id: "place-small",
			type: "symbol",
			source: "openmaptiles",
			"source-layer": "place",
			minzoom: 12,
			filter: classIn("suburb", "neighbourhood", "quarter", "hamlet"),
			layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 12, "text-max-width": 8 },
			paint: textPaint
		},
		{
			id: "place-town",
			type: "symbol",
			source: "openmaptiles",
			"source-layer": "place",
			minzoom: 6,
			filter: classIn("city", "town", "village"),
			layout: {
				"text-field": name,
				"text-font": ["Noto Sans Bold"],
				"text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 14, 14],
				"text-max-width": 8
			},
			paint: textPaint
		}
	]
};
