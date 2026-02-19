#!/usr/bin/env node
/**
 * Parses WITW26.kml into structured GeoJSON for the map app.
 * Outputs: public/data.json
 */
const fs = require("fs");
const path = require("path");
const { DOMParser } = require("@xmldom/xmldom");

const kmlPath = path.join(__dirname, "WITW26.kml");
const outDir = path.join(__dirname, "public");
const outPath = path.join(outDir, "data.json");

const kml = fs.readFileSync(kmlPath, "utf-8");
const doc = new DOMParser().parseFromString(kml, "text/xml");

function getText(el, tag) {
  const nodes = el.getElementsByTagName(tag);
  if (!nodes.length) return "";
  const child = nodes[0].firstChild;
  return child ? child.nodeValue.trim() : "";
}

function parseCoord(str) {
  // KML coordinates: "lng,lat,alt"
  const parts = str.trim().split(",");
  return [parseFloat(parts[0]), parseFloat(parts[1])];
}

function parseCoordinates(el) {
  const coordEl = el.getElementsByTagName("coordinates")[0];
  if (!coordEl || !coordEl.firstChild) return [];
  return coordEl.firstChild.nodeValue
    .trim()
    .split(/\s+/)
    .map(parseCoord);
}

const folders = doc.getElementsByTagName("Folder");
const result = { folders: [] };

for (let i = 0; i < folders.length; i++) {
  const folder = folders[i];
  const folderName = getText(folder, "name");
  const folderData = { name: folderName, routes: [], pois: [] };

  const placemarks = folder.getElementsByTagName("Placemark");
  for (let j = 0; j < placemarks.length; j++) {
    const pm = placemarks[j];
    const name = getText(pm, "name");
    const description = getText(pm, "description");

    const lineStrings = pm.getElementsByTagName("LineString");
    const points = pm.getElementsByTagName("Point");

    if (lineStrings.length > 0) {
      const coords = parseCoordinates(lineStrings[0]);
      folderData.routes.push({
        type: "Feature",
        properties: { name, description, folder: folderName },
        geometry: { type: "LineString", coordinates: coords },
      });
    } else if (points.length > 0) {
      const coords = parseCoordinates(points[0]);
      folderData.pois.push({
        type: "Feature",
        properties: { name, description, folder: folderName },
        geometry: { type: "Point", coordinates: coords[0] },
      });
    }
  }

  result.folders.push(folderData);
}

// Compute global bounds
let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
for (const f of result.folders) {
  for (const route of f.routes) {
    for (const [lng, lat] of route.geometry.coordinates) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }
  for (const poi of f.pois) {
    const [lng, lat] = poi.geometry.coordinates;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
}
result.bounds = [[minLng, minLat], [maxLng, maxLat]];

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

// Summary
let totalRoutes = 0, totalPois = 0;
for (const f of result.folders) {
  totalRoutes += f.routes.length;
  totalPois += f.pois.length;
}
console.log(`Parsed ${result.folders.length} folders, ${totalRoutes} routes, ${totalPois} POIs`);
console.log(`Bounds: [${minLng.toFixed(3)}, ${minLat.toFixed(3)}] to [${maxLng.toFixed(3)}, ${maxLat.toFixed(3)}]`);
console.log(`Written to ${outPath}`);
