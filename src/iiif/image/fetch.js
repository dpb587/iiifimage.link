import { ParseInfo as ParseInfoV2 } from "../image.v2/info";
import { ParseInfo as ParseInfoV3 } from "../image.v3/info";
import { InfoResponse } from "./info";

function normHeaders(entries) {
  const norm = [];

  for (const entry of entries) {
    norm.push([entry[0].toLowerCase(), entry[1]]);
  }

  norm.sort((a, b) => a[0].localeCompare(b[0]));

  return norm;
}

function fetchInfo(url) {
  const requestUrl = `${url}/info.json`;
  const requestHeaders = {
    Accept: "application/ld+json, application/json",
    // spec-literal, but invokes a CORS pre-flight and less-commonly supported
    // Accept: 'application/ld+json;profile=http://iiif.io/api/image/3/context.json, application/ld+json, application/json',
  };

  const ir = new InfoResponse();
  ir.httpUrl = requestUrl;
  ir.requestHeaders = normHeaders(Object.entries(requestHeaders));

  const tsStarted = new Date().getTime();

  return fetch(requestUrl, {
    headers: requestHeaders,
  })
    .then((res) => {
      const duration = new Date().getTime() - tsStarted;

      ir.httpStatus = res.status;
      ir.httpStatusText = res.statusText;
      ir.httpDuration = duration;
      ir.httpHeaders = normHeaders(res.headers.entries());

      return res
        .json()
        .then((json) => {
          ir.httpBodyJson = json;

          return ir;
        })
        .catch((err) => {
          ir.errors.push({
            message: "Invalid Response (JSON Parse Error)",
            detail: err.message,
            hints: ["Review the link to make sure it represents an image with an available info.json resource."],
          });

          return ir;
        });
    })
    .then((ir) => {
      let id = null;
      if (ir.errors.length == 0) {
        id = ParseInfoV3(ir);
        if (!id) {
          id = ParseInfoV2(ir);
        }
      }

      if (!id) {
        if (ir.httpStatus == 400 || ir.httpStatus == 404) {
          // generic enough to overwrite
          ir.errors = [
            {
              message: "Unexpected Response",
              detail: `HTTP ${ir.httpStatus}${ir.httpStatusText ? ` ${ir.httpStatusText}` : ""}`,
              hints: ["Review the link to make sure it represents an image with an available info.json resource."],
            },
          ];
        } else if (ir.httpStatus == 401 || ir.httpStatus == 403) {
          ir.errors.push({
            message: "Authentication Required",
            hints: [
              "This may be a valid image, but it requires authentication and those workflows are not currently supported here.",
            ],
          });
        } else if (ir.errors.length == 0) {
          ir.errors.push({
            message: "IIIF Image Not Detected",
            hints: [
              "Review the link to make sure it represents an image with an available info.json resource.",
              "If the link is correct and this is a parsing bug, please feel free to report an issue through links from the footer.",
            ],
          });
        }
      } else if (ir.httpStatus == 401 || ir.httpStatus == 403) {
        ir.errors.push({
          message: "Authentication Required",
          hints: [
            "Please note that authentication workflows are not currently supported here and image information may be incomplete.",
          ],
        });
      }

      return {
        http: ir,
        info: id,
      };
    }).catch((err) => {
      ir.errors.push({
        message: "Connection Failed",
        detail: err.message,
        hints: [
          "Review the link to make sure the server is accessible.",
          "Check the browser's Developer Tools for additional technical details.",
        ],
      });

      return {
        http: ir,
      }
    });
}

export { fetchInfo };
