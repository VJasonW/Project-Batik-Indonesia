import * as THREE from 'three';

// Province name mapping from GeoJSON property names to clean names
export const PROVINCE_NAME_MAP: Record<string, string> = {
  'DKI JAKARTA': 'DKI Jakarta',
  'PROBANTEN': 'Banten',
  'JAWA BARAT': 'Jawa Barat',
  'JAWA TENGAH': 'Jawa Tengah',
  'DAERAH ISTIMEWA YOGYAKARTA': 'DI Yogyakarta',
  'JAWA TIMUR': 'Jawa Timur',
  'DI. ACEH': 'Aceh',
  'SUMATERA UTARA': 'Sumatera Utara',
  'SUMATERA BARAT': 'Sumatera Barat',
  'RIAU': 'Riau',
  'JAMBI': 'Jambi',
  'SUMATERA SELATAN': 'Sumatera Selatan',
  'BENGKULU': 'Bengkulu',
  'LAMPUNG': 'Lampung',
  'BANGKA BELITUNG': 'Kepulauan Bangka Belitung',
  'BALI': 'Bali',
  'NUSATENGGARA BARAT': 'Nusa Tenggara Barat',
  'NUSA TENGGARA TIMUR': 'Nusa Tenggara Timur',
  'KALIMANTAN BARAT': 'Kalimantan Barat',
  'KALIMANTAN TENGAH': 'Kalimantan Tengah',
  'KALIMANTAN SELATAN': 'Kalimantan Selatan',
  'KALIMANTAN TIMUR': 'Kalimantan Timur',
  'SULAWESI UTARA': 'Sulawesi Utara',
  'SULAWESI TENGAH': 'Sulawesi Tengah',
  'SULAWESI SELATAN': 'Sulawesi Selatan',
  'SULAWESI TENGGARA': 'Sulawesi Tenggara',
  'GORONTALO': 'Gorontalo',
  'MALUKU': 'Maluku',
  'MALUKU UTARA': 'Maluku Utara',
  'IRIAN JAYA TIMUR': 'Papua',
  'IRIAN JAYA TENGAH': 'Papua Tengah',
  'IRIAN JAYA BARAT': 'Papua Barat',
};

// Province GeoJSON kode to slug mapping
export const PROVINCE_KODE_TO_SLUG: Record<string, string> = {
  '11': 'aceh',
  '12': 'sumatera-utara',
  '13': 'sumatera-barat',
  '14': 'riau',
  '15': 'jambi',
  '16': 'sumatera-selatan',
  '17': 'bengkulu',
  '18': 'lampung',
  '19': 'bangka-belitung',
  '31': 'dki-jakarta',
  '32': 'jawa-barat',
  '33': 'jawa-tengah',
  '3329': 'jawa-tengah',
  '34': 'di-yogyakarta',
  '35': 'jawa-timur',
  '36': 'banten',
  '51': 'bali',
  '52': 'nusa-tenggara-barat',
  '53': 'nusa-tenggara-timur',
  '61': 'kalimantan-barat',
  '62': 'kalimantan-tengah',
  '63': 'kalimantan-selatan',
  '64': 'kalimantan-timur',
  '71': 'sulawesi-utara',
  '72': 'sulawesi-tengah',
  '73': 'sulawesi-selatan',
  '74': 'sulawesi-tenggara',
  '75': 'gorontalo',
  '81': 'maluku-utara',
  '82': 'maluku',
  '83': 'papua-barat',
  '84': 'papua-tengah',
  '85': 'papua',
};

// Map center and scale for Indonesia
const CENTER_LON = 118;
const CENTER_LAT = -2;
const SCALE = 12;

/**
 * Convert longitude/latitude to 3D coordinates
 */
export function lonLatToXY(lon: number, lat: number): [number, number] {
  const x = (lon - CENTER_LON) * SCALE * Math.cos((CENTER_LAT * Math.PI) / 180);
  const y = (lat - CENTER_LAT) * SCALE;
  return [x, y]; // Fixed Y projection
}

/**
 * Inverse conversion: 2D coordinates back to longitude/latitude
 */
export function xyToLonLat(x: number, y: number): [number, number] {
  const lon = x / (SCALE * Math.cos((CENTER_LAT * Math.PI) / 180)) + CENTER_LON;
  const lat = y / SCALE + CENTER_LAT;
  return [lon, lat];
}

/**
 * Warp a 3D flat geometry onto a sphere of a given radius
 */
export function warpGeometryToSphere(geometry: THREE.BufferGeometry, radius: number): void {
  const positionAttribute = geometry.getAttribute('position');
  if (!positionAttribute) return;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);

    // Map 2D shape coords back to lon/lat
    const [lon, lat] = xyToLonLat(x, y);

    // Scale map coordinates by 1.2 (20% larger) relative to the center of Indonesia
    const scaleFactor = 1.2;
    const scaledLon = (lon - CENTER_LON) * scaleFactor + CENTER_LON;
    const scaledLat = (lat - CENTER_LAT) * scaleFactor + CENTER_LAT;

    const radLon = (scaledLon * Math.PI) / 180;
    const radLat = (scaledLat * Math.PI) / 180;

    // Radius includes extrusion depth (z)
    const r = radius + z;

    // Convert to spherical 3D Cartesian coordinates
    const sX = r * Math.cos(radLat) * Math.sin(radLon);
    const sY = r * Math.sin(radLat);
    const sZ = r * Math.cos(radLat) * Math.cos(radLon);

    positionAttribute.setXYZ(i, sX, sY, sZ);
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();
}

/**
 * Convert GeoJSON polygon coordinates to THREE.Shape
 */
export function polygonToShape(coords: number[][]): THREE.Shape {
  const shape = new THREE.Shape();
  coords.forEach((point, i) => {
    const [x, y] = lonLatToXY(point[0], point[1]);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });
  return shape;
}

/**
 * Convert GeoJSON MultiPolygon/Polygon to array of THREE.Shape
 */
export function geoJsonToShapes(geometry: {
  type: string;
  coordinates: number[][][][] | number[][][];
}): THREE.Shape[] {
  const shapes: THREE.Shape[] = [];

  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as number[][][];
    // First ring is exterior, rest are holes
    const shape = polygonToShape(coords[0]);
    if (coords.length > 1) {
      for (let i = 1; i < coords.length; i++) {
        const hole = new THREE.Path();
        coords[i].forEach((point, j) => {
          const [x, y] = lonLatToXY(point[0], point[1]);
          if (j === 0) hole.moveTo(x, y);
          else hole.lineTo(x, y);
        });
        shape.holes.push(hole);
      }
    }
    shapes.push(shape);
  } else if (geometry.type === 'MultiPolygon') {
    const multiCoords = geometry.coordinates as number[][][][];
    for (const polygon of multiCoords) {
      const shape = polygonToShape(polygon[0]);
      if (polygon.length > 1) {
        for (let i = 1; i < polygon.length; i++) {
          const hole = new THREE.Path();
          polygon[i].forEach((point, j) => {
            const [x, y] = lonLatToXY(point[0], point[1]);
            if (j === 0) hole.moveTo(x, y);
            else hole.lineTo(x, y);
          });
          shape.holes.push(hole);
        }
      }
      shapes.push(shape);
    }
  }

  return shapes;
}

/**
 * Get center point of a set of shapes (for label placement)
 */
export function getShapesCenter(shapes: THREE.Shape[]): [number, number] {
  let totalX = 0;
  let totalY = 0;
  let count = 0;

  for (const shape of shapes) {
    const points = shape.getPoints();
    for (const point of points) {
      totalX += point.x;
      totalY += point.y;
      count++;
    }
  }

  return [totalX / count, totalY / count];
}

// Color palette for provinces — batik earth tones
const PROVINCE_COLORS = [
  '#8B6914', // dark goldenrod
  '#A0522D', // sienna
  '#6B4226', // brown
  '#8B7355', // burlywood4
  '#CD853F', // peru
  '#D2691E', // chocolate
  '#B8860B', // darkgoldenrod
  '#9E7B4A', // warm brown
  '#7B6B4F', // olive brown
  '#A67C52', // warm tan
  '#876445', // cocoa
  '#6E5B3A', // umber
  '#957B5F', // taupe
  '#B28D60', // sand
  '#7F6045', // russet
  '#9B7653', // bronze
];

export function getProvinceColor(index: number): string {
  return PROVINCE_COLORS[index % PROVINCE_COLORS.length];
}
