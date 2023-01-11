const serviceName = "Image Service (v3)";
const serviceSpecUrl = "https://iiif.io/api/image/3.0/";

export { serviceName, serviceSpecUrl };

const complianceNameLevel0 = "Level 0";
const complianceNameLevel1 = "Level 1";
const complianceNameLevel2 = "Level 2";
const complianceSpecUrl = "https://iiif.io/api/image/3.0/compliance/";

export { complianceNameLevel0, complianceNameLevel1, complianceNameLevel2, complianceSpecUrl };

const builtinQualities = [
  {
    name: "bitonal",
    requiredLevels: [],
  },
  {
    name: "color",
    requiredLevels: ["level2"],
  },
  {
    name: "default",
    requiredLevels: ["level0", "level1", "level2"],
  },
  {
    name: "gray",
    requiredLevels: ["level2"],
  },
];

const builtinFormats = [
  {
    name: "jpg",
    requiredLevels: ["level0", "level1", "level2"],
  },
  {
    name: "png",
    requiredLevels: ["level2"],
  },
  {
    name: "gif",
    requiredLevels: [],
  },
  {
    name: "jp2",
    requiredLevels: [],
  },
  {
    name: "pdf",
    requiredLevels: [],
  },
  {
    name: "webp",
    requiredLevels: [],
  },
  {
    name: "tif",
    requiredLevels: [],
  },
];

const builtinFeatures = [
  {
    name: "baseUriRedirect",
    category: "HTTP",
    description: "The base URI of the service will redirect to the image information document.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "canonicalLinkHeader",
    category: "HTTP",
    description: "The canonical image URI HTTP link header is provided on image responses.",
    requiredLevels: [],
  },
  {
    name: "cors",
    category: "HTTP",
    description: "The CORS HTTP headers are provided on all responses.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "jsonldMediaType",
    category: "HTTP",
    description: "The JSON-LD media type is provided when requested.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "mirroring",
    category: "Rotation",
    description:
      "The image may be rotated around the vertical axis, resulting in a left-to-right mirroring of the content.",
    requiredLevels: [],
  },
  {
    name: "profileLinkHeader",
    category: "HTTP",
    description: "The profile HTTP link header is provided on image responses.",
    requiredLevels: [],
  },
  {
    name: "regionByPct",
    category: "Region",
    description: "Regions of the full image may be requested by percentage.",
    requiredLevels: ["level2"],
  },
  {
    name: "regionByPx",
    category: "Region",
    description: "Regions of the full image may be requested by pixel dimensions.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "regionSquare",
    category: "Region",
    description:
      "A square region may be requested, where the width and height are equal to the shorter dimension of the full image.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "rotationArbitrary",
    category: "Rotation",
    description: "Image rotation may be requested using values other than multiples of 90 degrees.",
    requiredLevels: [],
  },
  {
    name: "rotationBy90s",
    category: "Rotation",
    description: "Image rotation may be requested in multiples of 90 degrees.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeByConfinedWh",
    category: "Size",
    description: "Image size may be requested in the form `!w,h`.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeByH",
    category: "Size",
    description: "Image size may be requested in the form `,h`.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "sizeByPct",
    category: "Size",
    description: "Images size may be requested in the form `pct:n`.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeByW",
    category: "Size",
    description: "Image size may be requested in the form `w,`.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "sizeByWh",
    category: "Size",
    description: "Image size may be requested in the form `w,h`.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "sizeUpscaling",
    category: "Size",
    description: "Image sizes prefixed with `^` may be requested.",
    requiredLevels: [],
  },
];

export { builtinFeatures, builtinFormats, builtinQualities };
