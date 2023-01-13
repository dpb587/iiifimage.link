import { parseCommonImage, parseCommonSizes, parseCommonTiles } from "../image/common";
import { InfoDescriptor, resolveFeatureSet } from "../image/info";
import {
  builtinFeatures,
  builtinFormats,
  builtinQualities,
  complianceNameLevel0,
  complianceNameLevel1,
  complianceNameLevel2,
  complianceSpecUrl,
  serviceName,
  serviceSpecUrl,
} from "./builtins";

function ParseInfo({ httpUrl, httpBodyJson }) {
  if (!httpBodyJson) {
    return undefined;
  } else if (httpBodyJson["protocol"] != "http://iiif.io/api/image") {
    return undefined;
  } else if (!httpBodyJson["@context"]) {
    return undefined;
  } else if (!httpBodyJson["@id"]) {
    return undefined;
  } else if (httpBodyJson["@type"] && httpBodyJson["@type"] != "iiif:Image") {
    return undefined;
  }

  let isV2 = false;

  for (const v of Array.isArray(httpBodyJson["@context"]) ? httpBodyJson["@context"] : [httpBodyJson["@context"]]) {
    if (v == "http://iiif.io/api/image/2/context.json") {
      isV2 = true;

      break;
    }
  }

  if (!isV2) {
    return undefined;
  }

  const id = new InfoDescriptor();
  id.rootId = new URL(httpBodyJson["@id"], httpUrl).toString();
  id.rootVersion = 2;
  id.rootServiceName = serviceName;
  id.rootServiceSpecUrl = serviceSpecUrl;
  id.rootComplianceSpecUrl = complianceSpecUrl;

  let protoCompliance = null;
  const aggregateFormats = [];
  const aggregateQualities = [];
  const aggregateSupports = [];

  // ambiguous in spec and wild; .maxWidth (e.g. bodleian) vs .profile[].maxWidth
  let knownMaxWidth = httpBodyJson["maxWidth"];
  let knownMaxHeight = httpBodyJson["maxHeight"];
  let knownMaxArea = httpBodyJson["maxArea"];

  for (const k in httpBodyJson["profile"]) {
    const v = httpBodyJson["profile"][k];

    if (k == 0) {
      // The first entry in the list must be a compliance level URI.
      switch (v) {
        case "http://iiif.io/api/image/2/level0":
        case "http://iiif.io/api/image/2/level0.json":
          id.rootComplianceName = complianceNameLevel0;
          protoCompliance = "level0";
          break;
        case "http://iiif.io/api/image/2/level1":
        case "http://iiif.io/api/image/2/level1.json":
          id.rootComplianceName = complianceNameLevel1;
          protoCompliance = "level1";
          break;
        case "http://iiif.io/api/image/2/level2":
        case "http://iiif.io/api/image/2/level2.json":
          id.rootComplianceName = complianceNameLevel2;
          protoCompliance = "level2";
          break;
        default:
          return undefined;
      }

      continue;
    } else if (typeof v === "object" && !Array.isArray(v) && v !== null) {
      if (v["@type"] && v["@type"] != "iiif:ImageProfile") {
        continue;
      }

      if (v["formats"]) {
        aggregateFormats.push(...v["formats"]);
      }

      if (v["qualities"]) {
        aggregateQualities.push(...v["qualities"]);
      }

      if (v["supports"]) {
        aggregateSupports.push(...v["supports"]);
      }

      if (v["maxWidth"]) {
        knownMaxWidth = v["maxWidth"];
      }

      if (v["maxHeight"]) {
        knownMaxHeight = v["maxHeight"];
      }

      if (v["maxArea"]) {
        knownMaxArea = v["maxArea"];
      }
    }
  }

  id.rootFeatures = resolveFeatureSet(builtinFeatures, protoCompliance, aggregateSupports);

  for (const feature of id.rootFeatures) {
    switch (feature.name) {
      case "sizeAboveFull":
        // TODO
        break;
      case "sizeByDistortedWh":
        // TODO now explicit in v3
        break;
      case "sizeByWhListed":
        // TODO deprecated in v2
        break;
      case "sizeByForcedWh":
        // TODO deprecated in v2
        break;
      case "mirroring":
      case "regionByPct":
      case "regionByPx":
      case "regionSquare":
      case "rotationArbitrary":
      case "rotationBy90s":
      case "sizeByConfinedWh":
      case "sizeByH":
      case "sizeByPct":
      case "sizeByW":
      case "sizeByWh":
        id.uiFeatureFlags[feature.name] = true;
        break;
    }
  }

  id.uiQualities = resolveFeatureSet(builtinQualities, protoCompliance, aggregateQualities)
    .filter((v) => v.supported)
    .map((v) => v.name);
  id.uiFormats = resolveFeatureSet(builtinFormats, protoCompliance, aggregateFormats)
    .filter((v) => v.supported)
    .map((v) => v.name);

  if (httpBodyJson["attribution"]) {
    // untested
    id.uiTerms.push(
      ...(Array.isArray(httpBodyJson["attribution"]) ? httpBodyJson["attribution"] : [httpBodyJson["attribution"]]).map(
        (v) => ({
          label: "Attribution",
          value: v["@value"],
        })
      )
    );
  }

  if (httpBodyJson["license"]) {
    id.uiTerms.push(
      ...(Array.isArray(httpBodyJson["license"]) ? httpBodyJson["license"] : [httpBodyJson["license"]]).map((v) => ({
        label: "License",
        value: `<a class="underline" href=${v} target="_blank">${v.replace(/^(https?:\/\/|)/, '')}</a>`,
      }))
    );
  }

  parseCommonImage(id, httpBodyJson)
  parseCommonSizes(id, httpBodyJson)
  parseCommonTiles(id, httpBodyJson)

  id.configureThumbnail()

  if (knownMaxWidth) {
    id.uiMaxWidth = knownMaxWidth;
    id.uiTerms.push({
      label: "Maximum",
      value: `Width (${knownMaxWidth})`,
    });
  }

  if (knownMaxHeight) {
    id.uiMaxHeight = knownMaxHeight;
    id.uiTerms.push({
      label: "Maximum",
      value: `Height (${knownMaxHeight})`,
    });
  }

  if (knownMaxArea) {
    id.uiMaxArea = knownMaxArea;
    id.uiTerms.push({
      label: "Maximum",
      value: `Area (${knownMaxArea})`,
    });
  }

  return id;
}

export { ParseInfo };
