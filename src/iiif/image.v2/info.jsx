import { InfoDescriptor, resolveFeatureSet } from "../image/info"
import { builtinFeatures, builtinFormats, builtinQualities, complianceNameLevel0, complianceNameLevel1, complianceNameLevel2, complianceSpecUrl, serviceName, serviceSpecUrl } from "./builtins"

function ParseInfo({ httpUrl, httpBodyJson }) {
  if (!httpBodyJson) {
    return undefined
  } else if (httpBodyJson['protocol'] != 'http://iiif.io/api/image') {
    return undefined
  } else if (!httpBodyJson['@context']) {
    return undefined
  } else if (!httpBodyJson['@id']) {
    return undefined
  } else if (httpBodyJson['@type'] && httpBodyJson['@type'] != 'iiif:Image') {
    return undefined
  }

  let isV2 = false

  for (const v of Array.isArray(httpBodyJson['@context']) ? httpBodyJson['@context'] : [httpBodyJson['@context']]) {
    if (v == 'http://iiif.io/api/image/2/context.json') {
      isV2 = true

      break
    }
  }

  if (!isV2) {
    return undefined
  }

  const id = new InfoDescriptor()
  id.rootId = new URL(httpBodyJson['@id'], httpUrl).toString()
  id.rootServiceName = serviceName
  id.rootServiceSpecUrl = serviceSpecUrl
  id.rootComplianceSpecUrl = complianceSpecUrl

  let protoCompliance = null;
  const aggregateFormats = [];
  const aggregateQualities = [];
  const aggregateSupports = [];

  for (const k in httpBodyJson['profile']) {
    const v = httpBodyJson['profile'][k];

    if (k == 0) {
      // The first entry in the list must be a compliance level URI.
      switch (v) {
      case 'http://iiif.io/api/image/2/level0':
      case 'http://iiif.io/api/image/2/level0.json':
        id.rootComplianceName = complianceNameLevel0
        protoCompliance = 'level0'
        break
      case 'http://iiif.io/api/image/2/level1':
      case 'http://iiif.io/api/image/2/level1.json':
        id.rootComplianceName = complianceNameLevel1
        protoCompliance = 'level1'
        break
      case 'http://iiif.io/api/image/2/level2':
      case 'http://iiif.io/api/image/2/level2.json':
        id.rootComplianceName = complianceNameLevel2
        protoCompliance = 'level2'
        break
      default:
        return undefined
      }

      continue
    } else if (
      typeof v === 'object' &&
      !Array.isArray(v) &&
      v !== null
    ) {
      if (v['@type'] && v['@type'] != 'iiif:ImageProfile') {
        continue
      }

      if (v['formats']) {
        aggregateFormats.push(...v['formats'])
      }

      if (v['qualities']) {
        aggregateQualities.push(...v['qualities'])
      }

      if (v['supports']) {
        aggregateSupports.push(...v['supports'])
      }
    }
  }

  id.rootFeatures = resolveFeatureSet(builtinFeatures, protoCompliance, aggregateSupports)

  id.uiFeatureFlags // TODO
  id.uiQualities = resolveFeatureSet(builtinQualities, protoCompliance, aggregateQualities)
  id.uiFormats = resolveFeatureSet(builtinFormats, protoCompliance, aggregateFormats)

  if (httpBodyJson['attribution']) {
    // untested
    id.uiTerms.push(
      ...(Array.isArray(httpBodyJson['attribution']) ? httpBodyJson['attribution'] : [httpBodyJson['attribution']]).map(v => (
        {
          label: 'Attribution',
          value: <span dangerouslySetInnerHTML={v['@value']} />,
        }
      )),
    )
  }

  if (httpBodyJson['license']) {
    id.uiTerms.push(
      ...(Array.isArray(httpBodyJson['license']) ? httpBodyJson['license'] : [httpBodyJson['license']]).map(v => (
        {
          label: 'License',
          value: <a className="underline" href={v} target="_blank">{v}</a>,
        }
      )),
    )
  }

  id.uiImageWidth = httpBodyJson['width']
  id.uiImageHeight = httpBodyJson['height']
  id.uiTerms.push({
    label: 'Full Size',
    value: <span>{id.uiImageWidth}&times;{id.uiImageHeight}</span>,
  })

  id.uiThumbnailWidth = 512
  id.uiThumbnailHeight = Math.round(512 / id.uiImageWidth * id.uiImageHeight)
  id.uiThumbnailUrl = `${id.rootId}/full/${id.uiThumbnailWidth},${id.uiThumbnailHeight}/0/default.jpg`

  if (httpBodyJson['sizes']) {
    let seekingThumbnail = true

    for (const size of httpBodyJson['sizes']) {
      id.uiSizesPreferred.push({
        width: size.width,
        height: size.height || size.width,
      })

      if (seekingThumbnail && (size.width > 512 || size.height > 512)) {
        seekingThumbnail = false

        id.uiThumbnailUrl = `${id.rootId}/full/${size.width},${size.height}/0/default.jpg`
        id.uiThumbnailHeight = size.height
        id.uiThumbnailWidth = size.width
      }
    }
  }

  if (httpBodyJson['tiles']) {
    id.uiTerms.push(...httpBodyJson['tiles'].map(tiles => ({
      label: 'Tiles',
      value: <span>{tiles.width}&times;{tiles.height || tiles.width} ({tiles.scaleFactors.join('/')})</span>,
    })))
  }

  if (httpBodyJson['maxWidth']) {
    id.uiTerms.push({
      label: 'Maximum',
      value: `Width (${httpBodyJson['maxWidth']})`,
    })
  }

  if (httpBodyJson['maxHeight']) {
    id.uiTerms.push({
      label: 'Maximum',
      value: `Height (${httpBodyJson['maxHeight']})`,
    })
  }

  if (httpBodyJson['maxArea']) {
    id.uiTerms.push({
      label: 'Maximum',
      value: `Area (${httpBodyJson['maxArea']})`,
    })
  }

  return id
}

export { ParseInfo }
