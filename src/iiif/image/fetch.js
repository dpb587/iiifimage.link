import { ParseInfo as ParseInfoV2 } from "../image.v2/info";
import { ParseInfo as ParseInfoV3 } from "../image.v3/info";
import { InfoResponse } from "./info";

function fetchInfo(url) {
  const tsStarted = new Date().getTime()

  return fetch(`${url}/info.json`).
    then(res => {
      const duration = new Date().getTime() - tsStarted

      const headers = []

      for(const entry of res.headers.entries()) {
        headers.push([entry[0], entry[1]]);
      }

      const ir = new InfoResponse()
      ir.httpUrl = url
      ir.httpStatus = res.status
      ir.httpDuration = duration
      ir.httpHeaders = headers.sort((a, b) => a[0].localeCompare(b[0]))

      return res.json().
        then(json => {
          ir.httpBodyJson = json

          return ir
        }).
        catch(err => {
          ir.errors.push({
            message: `Invalid Response (JSON Parse Error)`,
            detail: err.message,
            hints: [
              'Double check the URL to make sure it represents an image with a valid info.json resource.',
            ],
          })

          return ir
        })
    }).
    then(ir => {
      let id = ParseInfoV3(ir)
      if (!id) {
        id = ParseInfoV2(ir)
      }

      return {
        http: ir,
        info: id,
      }
    })
}

export { fetchInfo }
