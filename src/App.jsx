import { Fragment, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LinkIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import "./App.css";
import { fetchInfo } from "./iiif/image/fetch";
import clsx from "clsx";
import ImageRequestBuilder from "./components/ImageRequestBuilder";
import WelcomeSection from "./components/WelcomeSection";
import { parseInputUrl } from "./iiif/image/url";

function groupTerms(input) {
  return Object.values(
    input.reduce(function (r, v) {
      (r[v.label] = r[v.label] || []).push(v);
      return r;
    }, {})
  );
}

const defaultUiFlags = {
  showFeatures: false,
  showAllFeatures: false,
  showHttpResponse: false,
  inputKey: "",
  inputImageParams: {},
};

function App() {
  const [urlInput, setUrlInput] = useState(() => {
    try {
      return decodeURIComponent(window.location.hash.replace(/^#/, ""));
    } catch (e) {
      return "";
    }
  });
  const [httpResponse, setHttpResponse] = useState(null);
  const [infoDescriptor, setInfoDescriptor] = useState(null);
  const [uiFlags, setUiFlags] = useState(defaultUiFlags);

  const uiThumbnailRef = useRef();

  function reset(push) {
    if (push) {
      setLocation("");
    }

    setUrlInput("");
    setHttpResponse(null);
    setInfoDescriptor(null);
    setUiFlags(defaultUiFlags);
  }

  function setLocation(url) {
    if (url == "") {
      try {
        // avoid useless `#` remaining in the url
        history.pushState("", document.title, window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = "";
      }
    } else {
      window.location.hash = `#${encodeURIComponent(url)}`;
    }
  }

  function reload(url) {
    const [serviceUrl, imageParams] = parseInputUrl(url);

    fetchInfo(serviceUrl)
      .then((res) => {
        setHttpResponse(res.http);
        setInfoDescriptor(res.info);
        setUiFlags({
          showFeatures: false,
          showAllFeatures: false,
          showHttpResponse: false,
          inputKey: url,
          inputImageParams: imageParams || {},
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function doSubmit(e) {
    e.preventDefault();

    if (urlInput == "") {
      return reset(true);
    }

    setLocation(urlInput);
  }

  function doClick(e) {
    if (urlInput != "" && urlInput == decodeURIComponent(window.location.hash.replace(/^#/, ""))) {
      // allow explicit re-requests even if unchanged
      reload(urlInput);

      return;
    }

    doSubmit(e);
  }

  function hashchange() {
    const url = decodeURIComponent(window.location.hash.replace(/^#/, ""));

    if (url == "") {
      reset(false);

      return;
    }

    setUrlInput(url);
    reload(url);
  }

  useEffect(() => {
    window.addEventListener("hashchange", hashchange, false);

    return () => {
      window.removeEventListener("hashchange", hashchange, false);
    };
  }, [window.location.hash]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-4 mt-4 px-4 text-center md:mt-12">
        <h1 className="text-xl font-light">
          <span className="font-medium">IIIF Image Inspector</span>
        </h1>
      </header>
      <section className="my-4">
        <form action="/" method="GET" onSubmit={doSubmit}>
          <div className="px-4">
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LinkIcon className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                type="url"
                name="url"
                className="pr-18 block w-full rounded-md border-neutral-300 pl-9 focus:border-neutral-500 focus:ring-neutral-500"
                placeholder="Paste a link to an IIIF Image&hellip;"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium uppercase text-neutral-800 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:bg-neutral-300 active:text-neutral-900"
                  onClick={doClick}
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
      <main className="overflow-hidden bg-white shadow-md lg:rounded-md">
        {!httpResponse && !infoDescriptor && <WelcomeSection setLocation={setLocation} />}
        {httpResponse && httpResponse.errors && httpResponse.errors.length > 0 && (
          <section className="my-2 sm:my-5">
            <div className="flex px-3 sm:px-4">
              <div className="relative z-0 -mt-1 mr-3 hidden px-2 pt-1.5 sm:block">
                <div className="z-10 -m-px rounded-sm border border-red-900 bg-red-800 p-1 shadow-sm">
                  <ExclamationCircleIcon className="h-4 w-4 text-neutral-50" />
                </div>
                <div className="absolute top-0 -bottom-1 left-5 -z-10 -ml-px w-0.5 bg-red-900" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium">Something went wrong&hellip;</div>
                {httpResponse.errors.map((err, errIdx) => (
                  <div key={errIdx} className="mt-1.5 pt-0.5 text-neutral-700">
                    <div className="font-medium">{err.message}</div>
                    {err.hints && (
                      <ul className="my-2.5 ml-6 list-disc sm:ml-8">
                        {err.hints.map((hint, hintIdx) => (
                          <li key={hintIdx}>{hint}</li>
                        ))}
                      </ul>
                    )}
                    {err.detail && (
                      <pre className="mt-1 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200">
                        <code>{err.detail}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {infoDescriptor && (
          <div className="my-3 space-y-6 sm:my-4">
            <section className="my-2 sm:my-5">
              <div className="flex px-3 sm:px-4">
                <div className="relative z-0 -mt-1 mr-3 hidden px-2 pt-1.5 sm:block">
                  <div className="z-10 -m-px rounded-sm border border-neutral-300 bg-white p-1 shadow-sm">
                    <InformationCircleIcon className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div className="absolute top-0 -bottom-1.5 left-5 -z-10 -ml-px w-0.5 bg-neutral-200" />
                </div>
                <div className="flex-1">
                  <div className="flex">
                    <div className="flex-1">
                      <div className="pt-px text-lg">
                        <a
                          className="font-medium hover:underline"
                          href={infoDescriptor.rootServiceSpecUrl}
                          target="_blank"
                        >
                          {infoDescriptor.rootServiceName}
                        </a>
                        ,{" "}
                        <a className="hover:underline" href={infoDescriptor.rootComplianceSpecUrl} target="_blank">
                          {infoDescriptor.rootComplianceName}
                        </a>
                      </div>
                    </div>
                    <div className="sm:pr-1.5">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium uppercase text-neutral-800 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:bg-neutral-300 active:text-neutral-900"
                        onClick={() =>
                          setUiFlags((uiFlags) => ({
                            ...uiFlags,
                            showFeatures: !uiFlags.showFeatures,
                            showAllFeatures: false,
                          }))
                        }
                      >
                        {infoDescriptor.rootFeatures.filter(v => v.supported).length} Features
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 sm:flex sm:space-x-3">
                    <div className="flex-0">
                      <a
                        className="-mx-3 block border-neutral-300 text-center sm:-m-px sm:border sm:p-0.5"
                        href={infoDescriptor.uiThumbnailUrl}
                        target="_blank"
                      >
                        <img
                          key={infoDescriptor.uiThumbnailUrl}
                          ref={uiThumbnailRef}
                          className="h-auto w-full sm:w-32"
                          height={infoDescriptor.uiThumbnailHeight}
                          src={infoDescriptor.uiThumbnailUrl}
                          width={infoDescriptor.uiThumbnailWidth}
                        />
                      </a>
                    </div>
                    {infoDescriptor.uiTerms.length > 0 && (
                      <div className="flex-1 pt-2 sm:pt-0.5">
                        <dl className="space-y-1 text-sm text-neutral-700">
                          {groupTerms(infoDescriptor.uiTerms).map((termValues) => (
                            <div key={termValues[0].label}>
                              <dt className="inline font-medium">{termValues[0].label}</dt>:{" "}
                              {termValues.map((termValue, termValueIdx) => (
                                <Fragment key={termValueIdx}>
                                  {termValueIdx > 0 && ", "}
                                  <dd className="inline" dangerouslySetInnerHTML={{__html: termValue.value}} />
                                </Fragment>
                              ))}
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
            {uiFlags.showFeatures && (
              <section className="my-2 sm:my-5">
                <div className="flex px-3 sm:px-4">
                  <div className="relative z-0 -mt-1 mr-3 hidden px-2 pt-1.5 sm:block">
                    <div className="z-10 -m-px rounded-sm border border-neutral-300 bg-white p-1 shadow-sm">
                      <SparklesIcon className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div className="absolute top-0 -bottom-1.5 left-5 -z-10 -ml-px w-0.5 bg-neutral-200" />
                  </div>
                  <div className="flex-1">
                    <div className="flex">
                      <div className="flex-1">
                        <div className="text-lg">Features</div>
                      </div>
                      <div className="sm:pr-1.5">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium uppercase text-neutral-800 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:bg-neutral-300 active:text-neutral-900"
                          onClick={() =>
                            setUiFlags((uiFlags) => ({ ...uiFlags, showAllFeatures: !uiFlags.showAllFeatures }))
                          }
                        >
                          {uiFlags.showAllFeatures ? "All Features" : "Supported"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1.5 flex space-x-3">
                      <table>
                        <tbody>
                          {infoDescriptor.rootFeatures
                            .filter(uiFlags.showAllFeatures ? (v) => true : (v) => v.supported)
                            .map((feature) => (
                              <tr key={feature.name}>
                                <td className="text-center align-top">
                                  {feature.supported ? (
                                    <div className="inline-flex items-center py-2">
                                      <CheckIcon className="h-5 w-5 text-sky-900" />
                                      <span className="sr-only ml-1">Supported</span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center py-2">
                                      <XMarkIcon className="h-5 w-5 bg-red-900 text-neutral-100" />
                                      <span className="sr-only ml-1">Not Supported</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 align-top">
                                  <div className="font-medium">{feature.name}</div>
                                  {feature.description && (
                                    <div className="text-sm text-neutral-500">{feature.description}</div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}
            <section className="my-4">
              <div className="px-1 sm:px-4">
                <ImageRequestBuilder
                  key={uiFlags.inputKey}
                  infoDescriptor={infoDescriptor}
                  defaultData={uiFlags.inputImageParams}
                />
              </div>
            </section>
          </div>
        )}
        {httpResponse && (
          <section className="mt-4">
            <button
              className={clsx(
                "flex w-full items-center border-t px-1 py-1.5 text-left font-mono text-xs hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-500 focus:ring-offset-1",
                uiFlags.showHttpResponse ? "bg-neutral-100 text-neutral-500" : "text-neutral-400 hover:bg-neutral-100"
              )}
              onClick={() => setUiFlags((uiFlags) => ({ ...uiFlags, showHttpResponse: !uiFlags.showHttpResponse }))}
            >
              <ChevronRightIcon
                className={clsx("h-4 w-4 transition-transform duration-100", uiFlags.showHttpResponse && "rotate-90")}
              />
              <span className="ml-0.5">info.json</span>
              <span className="mx-1"> &middot; </span>
              <span>
                {httpResponse.httpStatus}
                {httpResponse.httpStatusText && ` ${httpResponse.httpStatusText}`}
              </span>
              {httpResponse.httpDuration && (
                <>
                  <span className="mx-1"> &middot; </span>
                  <span>{httpResponse.httpDuration} ms</span>
                </>
              )}
            </button>
            {uiFlags.showHttpResponse && (
              <div className="whitespace-pre bg-neutral-900 p-2 font-mono text-sm text-neutral-400">
                <div className="space-y-2 overflow-x-auto px-0.5">
                  <div>
                    GET{" "}
                    <span className="font-bold">
                      <a className="underline" href={httpResponse.httpUrl}>
                        {httpResponse.httpUrl}
                      </a>
                    </span>
                  </div>
                  {httpResponse.requestHeaders.length > 0 && (
                    <div>
                      {httpResponse.requestHeaders.map((nv, nvIdx) => (
                        <div key={nvIdx} className="flex space-x-2">
                          <span>&gt;</span>
                          <pre className="whitespace-pre-wrap">
                            <code>
                              <span className="font-bold">{nv[0]}</span>: {nv[1]}
                            </code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    HTTP{" "}
                    <span className="font-bold">
                      {httpResponse.httpStatus}
                      {httpResponse.httpStatusText && ` ${httpResponse.httpStatusText}`}
                    </span>
                  </div>
                  {httpResponse.httpHeaders.length > 0 && (
                    <div>
                      {httpResponse.httpHeaders.map((nv, nvIdx) => (
                        <div key={nvIdx} className="flex space-x-2">
                          <span>&lt;</span>
                          <pre className="whitespace-pre-wrap">
                            <code>
                              <span className="font-bold">{nv[0]}</span>: {nv[1]}
                            </code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                  {httpResponse.httpBodyJson && (
                    <pre className="text-neutral-200">
                      <code>{JSON.stringify(httpResponse.httpBodyJson, "\n", "\t")}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="my-4 px-4 text-center text-xs text-neutral-600">
        <a className="underline" href="https://iiifimage.link/" rel="canonical">
          iiifimage.link
        </a>{" "}
        is{" "}
        <a className="underline" href="https://github.com/dpb587/iiifimage.link">
          open source
        </a>{" "}
        by{" "}
        <a className="underline" href="https://dpb587.me/">
          danny berger
        </a>
      </footer>
    </div>
  );
}

export default App;
