const serviceName = "Image Service (v2)";
const serviceSpecUrl = "https://iiif.io/api/image/2.1/";

export { serviceName, serviceSpecUrl };

const complianceNameLevel0 = "Level 0";
const complianceNameLevel1 = "Level 1";
const complianceNameLevel2 = "Level 2";
const complianceSpecUrl = "https://iiif.io/api/image/2.1/compliance/";

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
    description: "The CORS HTTP header is provided on all responses.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "jsonldMediaType",
    category: "HTTP",
    description: "The JSON-LD media type is provided when JSON-LD is requested.",
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
    description: "Regions of images may be requested by percentage.",
    requiredLevels: ["level2"],
  },
  {
    name: "regionByPx",
    category: "Region",
    description: "Regions of images may be requested by pixel dimensions.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "regionSquare",
    category: "Region",
    description:
      "A square region where the width and height are equal to the shorter dimension of the complete image content.",
    requiredLevels: [],
  },
  {
    name: "rotationArbitrary",
    category: "Rotation",
    description: "Rotation of images may be requested by degrees other than multiples of 90.",
    requiredLevels: [],
  },
  {
    name: "rotationBy90s",
    category: "Rotation",
    description: "Rotation of images may be requested by degrees in multiples of 90.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeAboveFull",
    category: "Size",
    description: "Size of images may be requested larger than the “full” size. See warning.",
    requiredLevels: [],
  },
  {
    name: "sizeByConfinedWh",
    category: "Size",
    description: "Size of images may be requested in the form “!w,h”.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeByDistortedWh",
    category: "Size",
    description: "Size of images may be requested in the form “w,h”, including sizes that would distort the image.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeByH",
    category: "Size",
    description: "Size of images may be requested in the form “,h”.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "sizeByPct",
    category: "Size",
    description: "Size of images may be requested in the form “pct:n”.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "sizeByW",
    category: "Size",
    description: "Size of images may be requested in the form “w,”.",
    requiredLevels: ["level1", "level2"],
  },
  {
    name: "sizeByWh",
    category: "Size",
    description:
      "Size of images may be requested in the form “w,h” where the supplied w and h preserve the aspect ratio.",
    requiredLevels: ["level2"],
  },
  {
    name: "sizeByWhListed",
    category: "Size",
    description: "See deprecation warning.",
    requiredLevels: [],
  },
  {
    name: "sizeByForcedWh",
    category: "Size",
    description: "See deprecation warning.",
    requiredLevels: [],
  },
];

export { builtinFeatures, builtinFormats, builtinQualities };
