class InfoResponse {
  httpUrl; // requestUrl
  requestHeaders = [];

  httpStatus;
  httpStatusText;
  httpDuration;
  httpHeaders;
  httpBody;
  httpBodyJson;

  errors = [];
}

class InfoDescriptor {
  rootId;
  rootServiceName;
  rootServiceSpecUrl;
  rootComplianceName;
  rootComplianceSpecUrl;
  rootFeatures;

  errors = [];

  uiImageHeight;
  uiImageWidth;
  uiThumbnailUrl;
  uiThumbnailHeight;
  uiThumbnailWidth;
  uiMaxWidth;
  uiMaxHeight;
  uiMaxArea;

  uiTerms = [];
  uiFeatureFlags = {};
  uiSizesPreferred = [];
  uiQualities = [];
  uiFormats = [];
  uiFormatsPreferred = [];
}

export { InfoResponse, InfoDescriptor };

function resolveFeatureSet(base, complianceLevel, extra = []) {
  const resolved = [];
  const known = {};

  for (const quality of base) {
    let supported = false;

    if (quality.requiredLevels.indexOf(complianceLevel) > -1) {
      supported = true;
    } else if (extra.indexOf(quality.name) > -1) {
      supported = true;
    }

    known[quality.name] = true;
    resolved.push({
      ...quality,
      supported,
    });
  }

  for (const v of extra) {
    if (!known[v]) {
      resolved.push({
        name: v,
        supported: true,
      });
    }
  }

  resolved.sort((a, b) => a.name.localeCompare(b.name));

  return resolved;
}

export { resolveFeatureSet };
