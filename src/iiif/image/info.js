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
  rootVersion;
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

  configureThumbnail() {
    const formatPreferred = this.uiFormatsPreferred[0] || "jpg";

    this.uiThumbnailWidth = 512;
    this.uiThumbnailHeight = Math.round((512 / this.uiImageWidth) * this.uiImageHeight);
    this.uiThumbnailUrl = `${this.rootId}/full/${this.uiThumbnailWidth},${this.uiThumbnailHeight}/0/default.${formatPreferred}`;

    // TODO handle level0 + max < 512
    for (const size of this.uiSizesPreferred) {
      if (size.width < 512 || size.height < 512) {
        continue
      }

      this.uiThumbnailUrl = `${this.rootId}/full/${size.width},${size.height}/0/default.${formatPreferred}`;
      this.uiThumbnailHeight = size.height;
      this.uiThumbnailWidth = size.width;

      return
    }
  }
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
