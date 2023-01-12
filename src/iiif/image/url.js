const reInfoJson = /\/info\.json$/;
const reMaybeImageParams = /\/([^\/]+)\/([^\/]+)\/(!?\d+)\/([^\.\/]+)\.([^\.\/]+)$/;

function parseInputUrl(input) {
  const inputNoQuery = input.split("?")[0];

  if (inputNoQuery.match(reInfoJson)) {
    return [inputNoQuery.replace(reInfoJson, ""), null];
  }

  const maybeImageParams = inputNoQuery.match(reMaybeImageParams);
  if (maybeImageParams) {
    try {
      const imageParams = parseImageParams(maybeImageParams);

      return [inputNoQuery.replace(reMaybeImageParams, ""), imageParams];
    } catch (e) {
      // probably parse/regexp bug to fix; or bad user data / not iiif image link
    }
  }

  return [inputNoQuery, null];
}

// TODO migrate full lib validation logic

function parseImageParams(match) {
  const uiData = {
    region: match[1],
    regionPercent: false,
    size: match[2],
    sizePercent: false,
    sizeConstrain: false,
    sizeUpscale: false,
    rotation: match[3],
    rotationFlip: false,
    quality: match[4],
    format: match[5],
  };

  if (uiData.region.match(/^pct:/)) {
    uiData.regionPercent = true;
    uiData.region = uiData.region.replace(/^pct:/, "");
  } else if (uiData.region.indexOf(",") > -1) {
    uiData.region.split(",").map(parseFloat); // lightweight validate
  }

  if (uiData.size.match(/^\^/)) {
    uiData.sizeUpscale = true;
    uiData.size = uiData.size.replace(/^\^/, "");
  }

  if (uiData.size.match(/!/)) {
    uiData.sizeConstrain = true;
    uiData.size = uiData.size.replace(/!/, "");
  }

  if (uiData.region.match(/^pct:/)) {
    uiData.regionPercent = true;
    uiData.region = uiData.region.replace(/^pct:/, "");
  } else if (uiData.region.indexOf(",") > -1) {
    uiData.region.split(",").filter(Boolean).map(parseFloat); // lightweight validate
  }

  if (uiData.rotation.match(/^!/)) {
    uiData.rotationFlip = true;
    uiData.rotation = uiData.rotation.replace(/!/, "");
  }

  return uiData;
}

export { parseInputUrl };
