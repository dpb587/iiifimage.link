import { InfoDescriptor, resolveFeatureSet } from "../image/info"
import { builtinFeatures, builtinFormats, builtinQualities, complianceNameLevel0, complianceNameLevel1, complianceNameLevel2, complianceSpecUrl, serviceName, serviceSpecUrl } from "./builtin"

function ParseInfo({ httpUrl, httpBodyJson }) {
  if (!httpBodyJson) {
    return undefined
  } else if (httpBodyJson['protocol'] != 'http://iiif.io/api/image') {
    return undefined
  } else if (!httpBodyJson['@context']) {
    return undefined
  } else if (!httpBodyJson['id']) {
    return undefined
  }

  let isV3 = false

  for (const v of Array.isArray(httpBodyJson['@context']) ? httpBodyJson['@context'] : [httpBodyJson['@context']]) {
    if (v == 'http://iiif.io/api/image/3/context.json') {
      isV3 = true

      break
    }
  }

  if (!isV3) {
    return undefined
  }

  const id = new InfoDescriptor()
  id.rootId = new URL(httpBodyJson.id, httpUrl).toString()
  id.rootServiceName = serviceName
  id.rootServiceSpecUrl = serviceSpecUrl
  id.rootComplianceSpecUrl = complianceSpecUrl

  switch (httpBodyJson['profile']) {
  case 'level0':
    id.rootComplianceName = complianceNameLevel0
    break
  case 'level1':
    id.rootComplianceName = complianceNameLevel1
    break
  case 'level2':
    id.rootComplianceName = complianceNameLevel2
    break
  default:
    return undefined
  }

  id.rootFeatures = resolveFeatureSet(builtinFeatures, httpBodyJson['profile'], httpBodyJson['extraFeatures'] || [])
  
  id.uiFeatureFlags = Object.fromEntries(id.rootFeatures.map(v => [v.name, v.supported]))
  id.uiQualities = resolveFeatureSet(builtinQualities, httpBodyJson['profile'], httpBodyJson['extraQualities'] || []).filter(v => v.supported).map(v => v.name)
  id.uiFormats = resolveFeatureSet(builtinFormats, httpBodyJson['profile'], httpBodyJson['extraFormats'] || []).filter(v => v.supported).map(v => v.name)
  id.uiFormatsPreferred = httpBodyJson['preferredFormats'] || []

  if (httpBodyJson['rights']) {
    id.uiTerms.push({
      label: 'Rights',
      value: <a className="underline" href={httpBodyJson['rights']} target="_blank">{httpBodyJson['rights']}</a>,
    })
  }

  if (httpBodyJson['partOf']) {
    id.uiTerms.push(...httpBodyJson['partOf'].map(partOf => ({
      label: 'Part of',
      value: <a className="underline" href={partOf.id} target="_blank">{partOf.label || partOf.type}</a>,
    })))
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
      id.uiPreferredSizes.push({
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
    id.uiMaxWidth = httpBodyJson['maxWidth']
    id.uiTerms.push({
      label: 'Maximum',
      value: `Width (${httpBodyJson['maxWidth']})`,
    })
  }

  if (httpBodyJson['maxHeight']) {
    id.uiMaxHeight = httpBodyJson['maxHeight']
    id.uiTerms.push({
      label: 'Maximum',
      value: `Height (${httpBodyJson['maxHeight']})`,
    })
  }

  if (httpBodyJson['maxArea']) {
    id.uiMaxArea = httpBodyJson['maxArea']
    id.uiTerms.push({
      label: 'Maximum',
      value: `Area (${httpBodyJson['maxArea']})`,
    })
  }

  return id
}

export { ParseInfo }
