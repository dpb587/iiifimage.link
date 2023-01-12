import { ExclamationTriangleIcon, PhotoIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import LoadingIcon from "../components/LoadingIcon";

function xywhRecalculate(infoDescriptor, xywh) {
  const { uiImageWidth, uiImageHeight } = infoDescriptor;

  return [
    // percentRegion
    `${Math.round((xywh.x / infoDescriptor.uiThumbnailWidth) * 10000) / 100},${
      Math.round((xywh.y / infoDescriptor.uiThumbnailHeight) * 10000) / 100
    },${Math.round((xywh.width / infoDescriptor.uiThumbnailWidth) * 10000) / 100},${
      Math.round((xywh.height / infoDescriptor.uiThumbnailHeight) * 10000) / 100
    }`,

    // pixelsRegion
    `${Math.round((xywh.x / infoDescriptor.uiThumbnailWidth) * uiImageWidth)},${Math.round(
      (xywh.y / infoDescriptor.uiThumbnailHeight) * uiImageHeight
    )},${Math.round((xywh.width / infoDescriptor.uiThumbnailWidth) * uiImageWidth)},${Math.round(
      (xywh.height / infoDescriptor.uiThumbnailHeight) * uiImageHeight
    )}`,
  ];
}

function ImageRequestBuilder({ infoDescriptor, defaultData = {} }) {
  const [params, setParams] = useState(() => {
    const base = {
      region: "full",
      regionPercent: false,
      size: infoDescriptor.rootVersion == 2 ? "full" : "max",
      sizePercent: false,
      sizeConstrain: false,
      sizeUpscale: false,
      rotation: "0",
      rotationFlip: false,
      quality: "default",
      format: "jpg",

      ...defaultData,
      rotationArbitrary: ["0", "90", "180", "270"].indexOf(defaultData.rotation) == -1,
    };

    if (base.region.indexOf(",") > -1) {
      try {
        const regionFloats = base.region.split(",").map(parseFloat);
        if (regionFloats.length != 4) {
          throw new Error("bail");
        }

        const xywh = base.regionPercent
          ? {
              x: (regionFloats[0] / 100) * infoDescriptor.uiThumbnailWidth,
              y: (regionFloats[1] / 100) * infoDescriptor.uiThumbnailHeight,
              width: (regionFloats[2] / 100) * infoDescriptor.uiThumbnailWidth,
              height: (regionFloats[3] / 100) * infoDescriptor.uiThumbnailHeight,
            }
          : {
              x: (regionFloats[0] / infoDescriptor.uiImageWidth) * infoDescriptor.uiThumbnailWidth,
              y: (regionFloats[1] / infoDescriptor.uiImageHeight) * infoDescriptor.uiThumbnailHeight,
              width: (regionFloats[2] / infoDescriptor.uiImageWidth) * infoDescriptor.uiThumbnailWidth,
              height: (regionFloats[3] / infoDescriptor.uiImageHeight) * infoDescriptor.uiThumbnailHeight,
            };

        const [percentRegion, pixelsRegion] = xywhRecalculate(infoDescriptor, xywh);

        base.regionEditorHintsData = xywh;
        base.regionEditorHintsPercent = percentRegion;
        base.regionEditorHintsPixels = pixelsRegion;
      } catch (e) {
        // oh well; their selection gets reset if they edit, though
      }
    }

    return base;
  });
  const [uiFlags, setUiFlags] = useState({
    editor: null,
  });

  const regionPreviewRef = useRef();

  function onCrop(e) {
    setParams((params) => {
      const [percentRegion, pixelsRegion] = xywhRecalculate(infoDescriptor, e.detail);
      const region = params.regionPercent ? percentRegion : pixelsRegion;

      if (params.region == region) return params;

      return {
        ...params,
        regionEditorHintsData: { ...e.detail },
        regionEditorHintsPercent: percentRegion,
        regionEditorHintsPixels: pixelsRegion,
        region,
      };
    });
  }

  let regionCanonical = `${params.regionPercent ? "pct:" : ""}${params.region}`;
  if (params.regionPercent) {
    if (params.region == "0,0,100,100") {
      regionCanonical = "full";
    }
  } else if (params.region == `0,0,${infoDescriptor.uiImageWidth},${infoDescriptor.uiImageHeight}`) {
    regionCanonical = "full";
  }

  let rotationCanonical = params.rotation;
  if (rotationCanonical == "360") {
    rotationCanonical = "0";
  }

  const configuredImageSlugs = [
    regionCanonical,
    `${params.sizeUpscale ? "^" : ""}${params.sizeConstrain ? "!" : ""}${params.sizePercent ? "pct:" : ""}${
      params.size
    }`,
    `${params.rotationFlip ? "!" : ""}${rotationCanonical}`,
    `${params.quality}.${params.format}`,
  ];

  const errors = [];

  // TODO migrate full lib validation logic

  if (!params.sizePercent && params.size != "max" && params.size != "full") {
    const [w, h] = params.size.split(",", 2);
    const wInt = parseInt(w);
    const hInt = parseInt(h);

    if (infoDescriptor.uiMaxArea) {
      const sizeArea = wInt * hInt;

      if (sizeArea > infoDescriptor.uiMaxArea) {
        errors.push(`Size has an area (${sizeArea}) which is greater than the maximum (${infoDescriptor.uiMaxArea})`);
      }
    }
  }

  const ActionButtons = () => (
    <Fragment>
      <button
        type="button"
        className="inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium uppercase text-neutral-800 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:bg-neutral-300 active:text-neutral-900"
        onClick={() => navigator.clipboard.writeText(`${infoDescriptor.rootId}/${configuredImageSlugs.join("/")}`)}
      >
        Copy
      </button>
      <a
        className="inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium uppercase text-neutral-800 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:bg-neutral-300 active:text-neutral-900"
        href={`${infoDescriptor.rootId}/${configuredImageSlugs.join("/")}`}
        target="_blank"
      >
        Open
      </a>
    </Fragment>
  );

  const AllowUpscalingInputGroup = () => (
    <div className="relative flex items-start">
      <div className="flex h-5 items-center">
        <input
          id="size-upscale"
          aria-describedby="size-upscale-description"
          name="size-upscale"
          type="checkbox"
          checked={params.sizeUpscale}
          onChange={() => setParams((params) => ({ ...params, sizeUpscale: !params.sizeUpscale }))}
          className="h-4 w-4 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-500"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor="size-upscale" className="text-neutral-700">
          <span className="font-medium">Allow Upscaling</span> when size is greater than the region.
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center px-2 py-2.5 sm:hidden">
        <div className="flex-grow font-medium">Image Parameters</div>
        <div className="space-x-1.5">
          <ActionButtons />
        </div>
      </div>
      <div className="rounded-md border border-neutral-300 bg-white shadow-sm">
        <div className="relative flex">
          <div
            className="absolute inset-y-0 left-0 hidden items-center pl-3 pr-2 sm:flex"
            title={infoDescriptor.rootId}
          >
            <PhotoIcon className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="flex w-full overflow-x-auto px-1 text-neutral-800 sm:pl-9 sm:pr-20">
            <div className="hidden py-2 px-0.5 text-neutral-400 sm:block">/</div>
            <button
              className="group relative px-1 py-2 tracking-wide sm:px-2"
              title="{region}"
              onClick={() =>
                setUiFlags((uiFlags) => ({ ...uiFlags, editor: uiFlags.editor == "region" ? null : "region" }))
              }
            >
              {configuredImageSlugs[0]}
              <div
                className={clsx(
                  "absolute inset-x-0.5 bottom-1 h-0.5 rounded-full transition duration-100",
                  uiFlags.editor == "region" ? "bg-neutral-800" : "bg-neutral-400 opacity-0 group-hover:opacity-100"
                )}
              />
            </button>
            <div className="py-2 px-0.5 text-neutral-400">/</div>
            <button
              className="group relative px-1 py-2 tracking-wide sm:px-2"
              title="{size}"
              onClick={() =>
                setUiFlags((uiFlags) => ({ ...uiFlags, editor: uiFlags.editor == "size" ? null : "size" }))
              }
            >
              {configuredImageSlugs[1]}
              <div
                className={clsx(
                  "absolute inset-x-0.5 bottom-1 h-0.5 rounded-full transition duration-100",
                  uiFlags.editor == "size" ? "bg-neutral-800" : "bg-neutral-400 opacity-0 group-hover:opacity-100"
                )}
              />
            </button>
            <div className="py-2 px-0.5 text-neutral-400">/</div>
            <button
              className="group relative px-1 py-2 tracking-wide sm:px-2"
              title="{rotation}"
              onClick={() =>
                setUiFlags((uiFlags) => ({ ...uiFlags, editor: uiFlags.editor == "rotation" ? null : "rotation" }))
              }
            >
              {configuredImageSlugs[2]}
              <div
                className={clsx(
                  "absolute inset-x-0.5 bottom-1 h-0.5 rounded-full transition duration-100",
                  uiFlags.editor == "rotation" ? "bg-neutral-800" : "bg-neutral-400 opacity-0 group-hover:opacity-100"
                )}
              />
            </button>
            <div className="py-2 px-0.5 text-neutral-400">/</div>
            <button
              className="group relative px-1 py-2 tracking-wide sm:px-2"
              title="{quality}.{format}"
              onClick={() =>
                setUiFlags((uiFlags) => ({ ...uiFlags, editor: uiFlags.editor == "file" ? null : "file" }))
              }
            >
              {configuredImageSlugs[3]}
              <div
                className={clsx(
                  "absolute inset-x-0.5 bottom-1 h-0.5 rounded-full transition duration-100",
                  uiFlags.editor == "file" ? "bg-neutral-800" : "bg-neutral-400 opacity-0 group-hover:opacity-100"
                )}
              />
            </button>
          </div>
          <div className="absolute inset-y-1.5 right-1.5 -mr-px hidden items-center space-x-1.5 sm:flex">
            <ActionButtons />
          </div>
        </div>
        {uiFlags.editor && (
          <div className="mx-1 border-t border-neutral-300">
            <div className="-mx-1">
              {uiFlags.editor == "region" && (
                <div className="sm:grid sm:grid-cols-4">
                  <div className="px-4 py-3">
                    <label className="text-base font-medium text-neutral-900">Region</label>
                    <div className="mt-2.5 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center">
                          <input
                            id="region-full"
                            name="region"
                            type="radio"
                            className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                            checked={params.region == "full"}
                            onChange={() =>
                              setParams((params) => ({ ...params, region: "full", regionPercent: false }))
                            }
                          />
                          <label htmlFor="region-full" className="ml-3 block text-sm font-medium text-neutral-700">
                            Full
                          </label>
                        </div>

                        {infoDescriptor.uiFeatureFlags.regionSquare && (
                          <div className="flex items-center">
                            <input
                              id="region-square"
                              name="region"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.region == "square"}
                              onChange={() =>
                                setParams((params) => ({ ...params, region: "square", regionPercent: false }))
                              }
                            />
                            <label htmlFor="region-square" className="ml-3 block text-sm font-medium text-neutral-700">
                              Square
                            </label>
                          </div>
                        )}

                        {infoDescriptor.uiFeatureFlags.regionByPct && (
                          <div className="flex items-center">
                            <input
                              id="region-pct"
                              name="region"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.regionPercent}
                              onChange={() =>
                                setParams((params) => ({
                                  ...params,
                                  region: params.regionEditorHintsPercent || "0,0,100,100",
                                  regionPercent: true,
                                }))
                              }
                            />
                            <label htmlFor="region-pct" className="ml-3 block text-sm font-medium text-neutral-700">
                              Percent
                            </label>
                          </div>
                        )}

                        {infoDescriptor.uiFeatureFlags.regionByPx && (
                          <div className="flex items-center">
                            <input
                              id="region-pixels"
                              name="region"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.region != "full" && params.region != "square" && !params.regionPercent}
                              onChange={() =>
                                setParams((params) => ({
                                  ...params,
                                  region:
                                    params.regionEditorHintsPixels ||
                                    `0,0,${infoDescriptor.uiImageWidth},${infoDescriptor.uiImageHeight}`,
                                  regionPercent: false,
                                }))
                              }
                            />
                            <label htmlFor="region-pixels" className="ml-3 block text-sm font-medium text-neutral-700">
                              Pixels
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {params.region != "full" && params.region != "square" && (
                    <div className="col-span-3 p-1.5">
                      <div className="relative aspect-square w-full bg-neutral-400">
                        <LoadingIcon className="absolute top-1/2 left-1/2 -ml-4 -mt-4 h-8 w-8 animate-spin text-neutral-600" />
                        <Cropper
                          src={infoDescriptor.uiThumbnailUrl}
                          style={{ height: `100%`, width: "100%" }}
                          guides={false}
                          crop={onCrop}
                          ref={regionPreviewRef}
                          viewMode={1}
                          data={params.regionEditorHintsData}
                          checkOrientation={false}
                          autoCropArea={1}
                          rotatable={false}
                          scalable={false}
                          checkCrossOrigin={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {uiFlags.editor == "size" && (
                <div className="sm:grid sm:grid-cols-4">
                  <div className="px-4 py-3">
                    <label className="text-base font-medium text-neutral-900">Size</label>
                    <div className="mt-2.5 space-y-4">
                      <div className="space-y-2.5">
                        {infoDescriptor.rootVersion == 2 && (
                          <div className="flex items-center">
                            <input
                              id="size-full"
                              name="size"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.size == "full"}
                              onChange={() =>
                                setParams((params) => ({
                                  ...params,
                                  size: "full",
                                  sizeConstrain: false,
                                  sizePercent: false,
                                }))
                              }
                            />
                            <label htmlFor="size-full" className="ml-3 block text-sm font-medium text-neutral-700">
                              Full Size
                            </label>
                          </div>
                        )}
                        <div className="flex items-center">
                          <input
                            id="size-max"
                            name="size"
                            type="radio"
                            className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                            checked={params.size == "max"}
                            onChange={() =>
                              setParams((params) => ({
                                ...params,
                                size: "max",
                                sizeConstrain: false,
                                sizePercent: false,
                              }))
                            }
                          />
                          <label htmlFor="size-max" className="ml-3 block text-sm font-medium text-neutral-700">
                            Maximum
                          </label>
                        </div>

                        {infoDescriptor.uiFeatureFlags.sizeByPct && (
                          <div className="flex items-center">
                            <input
                              id="size-percent"
                              name="size"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.sizePercent}
                              onChange={() =>
                                setParams((params) => ({
                                  ...params,
                                  size: "100",
                                  sizeConstrain: false,
                                  sizePercent: true,
                                }))
                              }
                            />
                            <label htmlFor="size-percent" className="ml-3 block text-sm font-medium text-neutral-700">
                              Percent
                            </label>
                          </div>
                        )}

                        {(infoDescriptor.uiFeatureFlags.sizeByW ||
                          infoDescriptor.uiFeatureFlags.sizeByH ||
                          infoDescriptor.uiFeatureFlags.sizeByWh ||
                          (infoDescriptor.uiSizesPreferred || []).length > 0) && (
                          <div className="flex items-center">
                            <input
                              id="size-pixels"
                              name="size"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.size != "full" && params.size != "max" && !params.sizePercent}
                              onChange={() =>
                                setParams((params) => ({
                                  ...params,
                                  size: `${
                                    infoDescriptor.uiMaxWidth ? Math.min(512, infoDescriptor.uiMaxWidth) : 512
                                  },${infoDescriptor.uiMaxHeight ? Math.min(512, infoDescriptor.uiMaxHeight) : 512}`,
                                  sizeConstrain: false,
                                  sizePercent: false,
                                }))
                              }
                            />
                            <label htmlFor="size-pixels" className="ml-3 block text-sm font-medium text-neutral-700">
                              Pixels
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 px-4 py-3">
                    <label className="text-base font-light text-neutral-600">Options</label>
                    <div className="mt-2.5 space-y-4">
                      {params.size == "max" && infoDescriptor.uiFeatureFlags.sizeUpscaling && (
                        <AllowUpscalingInputGroup />
                      )}
                      {params.size != "full" && params.size != "max" && !params.sizePercent && (
                        <>
                          {(infoDescriptor.uiSizesPreferred || []).length > 0 && (
                            <div>
                              <label htmlFor="size-width" className="block text-sm font-medium text-neutral-700">
                                Preferred Sizes
                              </label>
                              <div className="relative mt-0.5 -mb-px leading-10">
                                {infoDescriptor.uiSizesPreferred.map((size, sizeIdx) => (
                                  <button
                                    key={`${size.width}x${size.height}`}
                                    className="mr-2 inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium uppercase text-neutral-800 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:bg-neutral-300 active:text-neutral-900"
                                    onClick={() =>
                                      setParams((params) => ({
                                        ...params,
                                        size: `${size.width},${size.height}`,
                                        sizePercent: false,
                                      }))
                                    }
                                  >
                                    {size.width}&times;{size.height}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {(infoDescriptor.uiFeatureFlags.sizeByW ||
                            infoDescriptor.uiFeatureFlags.sizeByH ||
                            infoDescriptor.uiFeatureFlags.sizeByWh) && (
                            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                              <div className="col-span-2">
                                <label htmlFor="size-width" className="block text-sm font-medium text-neutral-700">
                                  Width
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                  <input
                                    type="number"
                                    name="size-width"
                                    id="size-width"
                                    min="0"
                                    max={infoDescriptor.uiMaxWidth}
                                    className="block w-full rounded-md border-neutral-300 pl-3 pr-9 focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                                    value={params.size.split(",")[0]}
                                    onChange={(e) =>
                                      setParams((params) => ({
                                        ...params,
                                        size: `${e.target.value},${params.size.split(",")[1]}`,
                                      }))
                                    }
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-neutral-500 sm:text-sm">px</span>
                                  </div>
                                </div>
                              </div>

                              <div className="col-span-2">
                                <label htmlFor="size-height" className="block text-sm font-medium text-neutral-700">
                                  Height
                                </label>
                                <div className="relative mt-1 rounded-md shadow-sm">
                                  <input
                                    type="number"
                                    name="size-height"
                                    id="size-height"
                                    min="0"
                                    max={infoDescriptor.uiMaxHeight}
                                    className="block w-full rounded-md border-neutral-300 pl-3 pr-9 focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                                    value={params.size.split(",")[1]}
                                    onChange={(e) =>
                                      setParams((params) => ({
                                        ...params,
                                        size: `${params.size.split(",")[0]},${e.target.value}`,
                                      }))
                                    }
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-neutral-500 sm:text-sm">px</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="space-y-2.5">
                              {infoDescriptor.uiFeatureFlags.sizeUpscaling && <AllowUpscalingInputGroup />}
                              {infoDescriptor.uiFeatureFlags.sizeByConfinedWh && (
                                <div className="relative flex items-start">
                                  <div className="flex h-5 items-center">
                                    <input
                                      id="size-constrain"
                                      name="size-constrain"
                                      type="checkbox"
                                      checked={params.sizeConstrain}
                                      onChange={() =>
                                        setParams((params) => ({ ...params, sizeConstrain: !params.sizeConstrain }))
                                      }
                                      className="h-4 w-4 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="size-constrain" className="text-neutral-700">
                                      <span className="font-medium">Maintain Aspect Ratio</span> within size.
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      {params.sizePercent && (
                        <>
                          <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-2">
                              <label htmlFor="size-percent" className="block text-sm font-medium text-neutral-700">
                                Percent
                              </label>
                              <div className="relative mt-1 rounded-md shadow-sm">
                                <input
                                  type="number"
                                  name="size-percent"
                                  id="size-percent"
                                  min="0"
                                  className="block w-full rounded-md border-neutral-300 pl-3 pr-9 focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                                  value={params.size.split(",")[0]}
                                  onChange={(e) => setParams((params) => ({ ...params, size: e.target.value }))}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                  <span className="text-neutral-500 sm:text-sm">%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {infoDescriptor.uiFeatureFlags.sizeUpscaling && <AllowUpscalingInputGroup />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {uiFlags.editor == "rotation" && (
                <div className="sm:grid sm:grid-cols-4">
                  <div className="px-4 py-3">
                    <label className="text-base font-medium text-neutral-900">Rotation</label>
                    <div className="mt-2.5 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center">
                          <input
                            id="rotation-0"
                            name="rotation"
                            type="radio"
                            className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                            checked={!params.rotationArbitrary && params.rotation == "0"}
                            onChange={() =>
                              setParams((params) => ({ ...params, rotation: "0", rotationArbitrary: false }))
                            }
                          />
                          <label htmlFor="rotation-0" className="ml-3 block text-sm font-medium text-neutral-700">
                            0&#xb0;
                          </label>
                        </div>

                        {infoDescriptor.uiFeatureFlags.rotationBy90s && (
                          <>
                            <div className="flex items-center">
                              <input
                                id="rotation-90"
                                name="rotation"
                                type="radio"
                                className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                                checked={!params.rotationArbitrary && params.rotation == "90"}
                                onChange={() =>
                                  setParams((params) => ({ ...params, rotation: "90", rotationArbitrary: false }))
                                }
                              />
                              <label htmlFor="rotation-90" className="ml-3 block text-sm font-medium text-neutral-700">
                                90&#xb0;
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                id="rotation-180"
                                name="rotation"
                                type="radio"
                                className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                                checked={!params.rotationArbitrary && params.rotation == "180"}
                                onChange={() =>
                                  setParams((params) => ({ ...params, rotation: "180", rotationArbitrary: false }))
                                }
                              />
                              <label htmlFor="rotation-180" className="ml-3 block text-sm font-medium text-neutral-700">
                                180&#xb0;
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                id="rotation-270"
                                name="rotation"
                                type="radio"
                                className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                                checked={!params.rotationArbitrary && params.rotation == "270"}
                                onChange={() =>
                                  setParams((params) => ({ ...params, rotation: "270", rotationArbitrary: false }))
                                }
                              />
                              <label htmlFor="rotation-270" className="ml-3 block text-sm font-medium text-neutral-700">
                                270&#xb0;
                              </label>
                            </div>
                          </>
                        )}

                        {infoDescriptor.uiFeatureFlags.rotationArbitrary && (
                          <div className="flex items-center">
                            <input
                              id="rotation-arbitrary"
                              name="rotation"
                              type="radio"
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                              checked={params.rotationArbitrary}
                              onChange={() => setParams((params) => ({ ...params, rotationArbitrary: true }))}
                            />
                            <label
                              htmlFor="rotation-arbitrary"
                              className="ml-3 block text-sm font-medium text-neutral-700"
                            >
                              Arbitrary
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 px-4 py-3">
                    <label className="text-base font-light text-neutral-600">Options</label>
                    <div className="mt-2.5 space-y-4">
                      {params.rotationArbitrary && (
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-span-2">
                            <label htmlFor="rotation-percent" className="block text-sm font-medium text-neutral-700">
                              Percent
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                              <input
                                type="number"
                                name="rotation-percent"
                                id="rotation-percent"
                                min="0"
                                max="360"
                                className="block w-full rounded-md border-neutral-300 pl-3 pr-9 focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                                value={params.rotation}
                                onChange={(e) => setParams((params) => ({ ...params, rotation: e.target.value }))}
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-neutral-500 sm:text-sm">%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {infoDescriptor.uiFeatureFlags.mirroring && (
                        <div className="relative flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="rotation-flip"
                              name="rotation-flip"
                              type="checkbox"
                              checked={params.rotationFlip}
                              onChange={() =>
                                setParams((params) => ({ ...params, rotationFlip: !params.rotationFlip }))
                              }
                              className="h-4 w-4 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="rotation-flip" className="text-neutral-700">
                              <span className="font-medium">Mirror</span> by reflection on the vertical axis.
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {uiFlags.editor == "file" && (
                <div className="space-y-4 px-4 py-3">
                  <div>
                    <label className="text-base font-medium text-neutral-900">Quality</label>
                    <div className="mt-2.5">
                      <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                        {infoDescriptor.uiQualities.map((quality) => (
                          <div key={quality} className="flex items-center">
                            <input
                              id={`quality-${quality}`}
                              name="quality"
                              type="radio"
                              checked={params.quality == quality}
                              onChange={() => setParams((params) => ({ ...params, quality }))}
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                            />
                            <label
                              htmlFor={`quality-${quality}`}
                              className="ml-3 block text-sm font-medium text-neutral-700"
                            >
                              {quality}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <label className="text-base font-medium text-neutral-900">Format</label>{" "}
                      <span className="text-neutral-700">(* = preferred)</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                        {infoDescriptor.uiFormats.map((format) => (
                          <div key={format} className="flex items-center">
                            <input
                              id={`format-${format}`}
                              name="format"
                              type="radio"
                              checked={params.format == format}
                              onChange={() => setParams((params) => ({ ...params, format }))}
                              className="h-4 w-4 border-neutral-300 text-neutral-600 focus:ring-neutral-500"
                            />
                            <label
                              htmlFor={`format-${format}`}
                              className="ml-3 block text-sm font-medium text-neutral-700"
                            >
                              {format}
                              {(infoDescriptor.uiFormatsPreferred || []).indexOf(format) > -1 && "*"}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {errors.length > 0 && (
        <div className="-mt-1 rounded-b-md border border-t border-red-900 bg-neutral-50 text-sm font-medium shadow">
          <div className="relative flex py-2 text-red-900">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pr-2" title={infoDescriptor.rootId}>
              <ExclamationTriangleIcon className="h-4 w-4" />
            </div>
            <div className="flex w-full pl-9 pr-20">
              <ul>
                {errors.map((err, errIdx) => (
                  <li key={errIdx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageRequestBuilder;
