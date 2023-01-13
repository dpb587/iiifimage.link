function parseCommonImage(id, httpBodyJson) {
  id.uiImageWidth = httpBodyJson["width"];
  id.uiImageHeight = httpBodyJson["height"];
  id.uiTerms.push({
    label: "Size",
    value: `${id.uiImageWidth}&times;${id.uiImageHeight}`,
  });
}

function parseCommonSizes(id, httpBodyJson) {
  if (httpBodyJson["sizes"]) {
    const orderedSizes = [...httpBodyJson["sizes"]].sort((a, b) => {
      if (a.width < b.width) {
        return -1
      } else if (a.width > b.width) {
        return 1
      } else if (a.height < b.height) {
        return -1
      }

      return 1
    })

    for (const size of orderedSizes) {
      id.uiSizesPreferred.push({
        width: size.width,
        height: size.height || size.width,
      });
    }
  }
}

function parseCommonTiles(id, httpBodyJson) {
  if (httpBodyJson["tiles"]) {
    id.uiTerms.push(
      ...httpBodyJson["tiles"].map((tiles) => ({
        label: "Tiles",
        value: `${tiles.width}&times;${tiles.height || tiles.width} (${tiles.scaleFactors.sort((a, b) => a < b ? -1 : 1).join("/")})`,
      }))
    );
  }
}

export { parseCommonImage, parseCommonSizes, parseCommonTiles }
