import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowTopRightOnSquareIcon, CheckIcon, ChevronRightIcon, CodeBracketIcon, CodeBracketSquareIcon, ExclamationCircleIcon, InformationCircleIcon, LifebuoyIcon, LinkIcon, PhotoIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid"
import './App.css'
import { fetchInfo } from './iiif/image/fetch'
import clsx from 'clsx'
import ImageRequestBuilder from './components/ImageRequestBuilder'

function groupTerms(input) {
  return Object.values(
    input.reduce(function(r, v) {
      (r[v.label] = r[v.label] || []).push(v);
      return r;
    }, {})
  );
}

function App() {
  const [ urlInput, setUrlInput ] = useState(() => {
    try {
      return decodeURIComponent(window.location.hash.replace(/^#/, ''))
    } catch (e) {
      return ''
    }
  })
  const [ httpResponse, setHttpResponse ] = useState(null)
  const [ infoDescriptor, setInfoDescriptor ] = useState(null)
  const [ uiFlags, setUiFlags ] = useState({
    showFeatures: false,
    showAllFeatures: false,
    showHttpResponse: false,
  })

  const uiThumbnailRef = useRef()

  function reset(push) {
    if (push) {
      setLocation('')
    }

    setUrlInput('')
    setHttpResponse(null)
    setInfoDescriptor(null)
  }

  function setLocation(url) {
    if (url == '') {
      try {
        // avoids useless `#` remaining in the url
        history.pushState("", document.title, window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = ''
      }
    } else {
      window.location.hash = `#${encodeURIComponent(url)}`
    }
  }

  function reload(url) {
    fetchInfo(url).
      then(res => {
        setHttpResponse(res.http)
        setInfoDescriptor(res.info)
        setUiFlags({
          showFeatures: false,
          showAllFeatures: false,
          showHttpResponse: false,
        })
      }).
      catch(err => {
        console.log(err)
      })
  }

  function doSubmit(e) {
    e.preventDefault()

    if (urlInput == '') {
      return reset(true)
    }

    setLocation(urlInput)
  }

  function doClick(e) {
    if (urlInput != '' && urlInput == decodeURIComponent(window.location.hash.replace(/^#/, ''))) {
      // allow explicit re-requests even if unchanged
      reload(urlInput)

      return
    }
    
    doSubmit(e)
  }

  function showExample(e, target) {
    e.preventDefault()
    setLocation(target)
  }

  function hashchange() {
    const url = decodeURIComponent(window.location.hash.replace(/^#/, ''))

    if (url == '') {
      reset(false)

      return
    }

    setUrlInput(url)
    reload(url)
  }

  useEffect(() => {
    window.addEventListener('hashchange', hashchange, false);

    return () => {
      window.removeEventListener('hashchange', hashchange, false);
    }
  }, [window.location.hash])

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-4 mt-12 px-4 text-center">
        <h1 className="text-xl font-light">
          <span className="font-medium">IIIF Image Inspector</span>
        </h1>
      </header>
      <section className="my-4">
        <form action="/" method="GET" onSubmit={doSubmit}>
          <div className="px-4">
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LinkIcon className="text-neutral-500 w-4 h-4" />
              </div>
              <input
                type="url"
                name="url"
                className="block w-full rounded-md border-neutral-300 pl-9 pr-20 focus:border-neutral-500 focus:ring-neutral-500"
                placeholder="Paste any link about an IIIF Image&hellip;"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                <button
                  type="submit"
                  className="uppercase inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 active:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                  onClick={doClick}
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
      <main className="bg-white rounded-md shadow-md overflow-hidden">
        {!httpResponse && !infoDescriptor && (
          <section className="my-5">
            <div className="flex space-x-3 px-4 pb-0.5">
              <div className="relative px-2 pt-1.5 -mt-1 z-0">
                <div className="bg-white shadow-sm border border-neutral-300 -m-px rounded-sm p-1 z-10">
                  <LifebuoyIcon className="text-neutral-500 w-4 h-4" />
                </div>
                <div className="absolute top-0 -bottom-1 left-5 -ml-px w-0.5 bg-neutral-200 -z-10" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium">Links may be an image service, info.json, or image file URL.</div>
                <div className="mt-1.5 pt-0.5 text-neutral-800 leading-7">
                  <p>Hello! This is a small tool to inspect metadata about IIIF images and demonstrate how their image file URLs may be constructed. Here are a few examples to try it out&hellip;</p>
                  <ul className="list-disc my-2.5 ml-8">
                    <li><a className="font-medium underline" href="https://images.collections.yale.edu/iiif/2/ycba:cef381c4-9716-45e9-ac19-c8ee64808170" onClick={(e) => showExample(e, 'https://images.collections.yale.edu/iiif/2/ycba:cef381c4-9716-45e9-ac19-c8ee64808170')}>Canvas of Cornfield at sunset</a> from <a className="underline" href="https://collections.britishart.yale.edu/catalog/tms:511" target="_blank">Yale Center for British Art</a></li>
                    <li><a className="font-medium underline" href="https://iiif.ucd.ie/loris/ivrla:434" onClick={(e) => showExample(e, 'https://iiif.ucd.ie/loris/ivrla:434')}>Map of the City of Dublin</a> from <a className="underline" href="https://digital.ucd.ie/view/ivrla:431" target="_blank">UCD Digital Library</a></li>
                    <li><a className="font-medium underline" href="https://tile.loc.gov/image-services/iiif/service:music:musbaseball:musbaseball-100028:musbaseball-100028.0001" onClick={(e) => showExample(e, 'https://tile.loc.gov/image-services/iiif/service:music:musbaseball:musbaseball-100028:musbaseball-100028.0001')}>Music of Over the fence is out</a> from <a className="underline" href="https://www.loc.gov/resource/musbaseball.100028.0/" target="_blank">Library of Congress</a></li>
                    <li><a className="font-medium underline" href="https://iiif.bodleian.ox.ac.uk/iiif/image/b62bca5b-d064-4ce9-b668-40eb98edbe92" onClick={(e) => showExample(e, 'https://iiif.bodleian.ox.ac.uk/iiif/image/b62bca5b-d064-4ce9-b668-40eb98edbe92')}>Portrait of Margaret Beaufort</a> from <a className="underline" href="https://digital.bodleian.ox.ac.uk/objects/ab96d208-a553-45cc-b622-2c2210685119/" target="_blank">Bodleian Library</a></li>
                  </ul>
                  <p>You can learn more about the IIIF APIs from <a className="font-medium underline" href="https://iiif.io/api/" target="_blank">iiif.io</a>. This tool supports <a className="font-medium underline" href="https://iiif.io/api/image/2.1/" target="_blank">Version 2</a> and <a className="font-medium underline" href="https://iiif.io/api/image/3.0/" target="_blank">Version 3</a> of the Image API, but authentication-related workflows are not currently supported.</p>
                </div>
              </div>
            </div>
          </section>
        )}
        {httpResponse && httpResponse.errors && httpResponse.errors.length > 0 && (
          <section className="my-5">
            <div className="flex space-x-3 px-4">
              <div className="relative px-2 pt-1.5 -mt-1 z-0">
                <div className="bg-red-800 shadow-sm border border-red-900 -m-px rounded-sm p-1 z-10">
                  <ExclamationCircleIcon className="text-neutral-50 w-4 h-4" />
                </div>
                <div className="absolute top-0 -bottom-1 left-5 -ml-px w-0.5 bg-red-900 -z-10" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium">Something went wrong&hellip;</div>
                {httpResponse.errors.map((err, errIdx) => (
                  <div key={errIdx} className="mt-1.5 pt-0.5 text-neutral-700">
                    <div className="font-medium">{err.message}</div>
                    {err.hints && (
                      <ul>
                        {err.hints.map((hint, hintIdx) => (
                          <li key={hintIdx}>{hint}</li>
                        ))}
                      </ul>
                    )}
                    {err.detail && (
                      <pre className="mt-1 text-sm bg-neutral-900 text-neutral-200 px-2 py-1.5"><code>{err.detail}</code></pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        {infoDescriptor && (
          <div className="space-y-6 my-4">
            <section className="mt-5">
              <div className="flex space-x-3 px-4">
                <div className="relative px-2 pt-1.5 -mt-1 z-0">
                  <div className="bg-white shadow-sm border border-neutral-300 -m-px rounded-sm p-1 z-10">
                    <InformationCircleIcon className="text-neutral-500 w-4 h-4" />
                  </div>
                  <div className="absolute top-0 -bottom-1.5 left-5 -ml-px w-0.5 bg-neutral-200 -z-10" />
                </div>
                <div className="flex-1">
                  <div className="flex">
                    <div className="flex-1">
                      <div className="text-lg">
                        <a className="font-medium hover:underline" href={infoDescriptor.rootServiceSpecUrl} target="_blank">{infoDescriptor.rootServiceName}</a>,{' '}
                        <a className="hover:underline" href={infoDescriptor.rootComplianceSpecUrl} target="_blank">{infoDescriptor.rootComplianceName}</a>
                      </div>
                    </div>
                    <div className="pr-1.5">
                      <button
                        type="button"
                        className="uppercase inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 active:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                        onClick={() => setUiFlags(uiFlags => ({...uiFlags, showFeatures: !uiFlags.showFeatures, showAllFeatures: false}))}
                      >
                        {infoDescriptor.rootFeatures.length} Features
                      </button>
                    </div>
                  </div>
                  <div className="flex mt-1.5 space-x-3">
                    <div className="flex-0">
                      <a className="block border border-neutral-300 -m-px p-0.5 text-center" href={infoDescriptor.uiThumbnailUrl} target="_blank">
                        <img key={infoDescriptor.uiThumbnailUrl} ref={uiThumbnailRef} className="w-32 h-auto" height={infoDescriptor.uiThumbnailHeight} src={infoDescriptor.uiThumbnailUrl} width={infoDescriptor.uiThumbnailWidth} />
                      </a>
                    </div>
                    {infoDescriptor.uiTerms.length > 0 && (
                      <div className="flex-1 pt-0.5">
                        <dl className="text-sm text-neutral-700 space-y-1">
                          {groupTerms(infoDescriptor.uiTerms).map(termValues => (
                            <div key={termValues[0].label}>
                              <dt className="font-medium inline">{termValues[0].label}</dt>:{' '}
                              {termValues.map((termValue, termValueIdx) => (
                                <Fragment key={termValueIdx}>
                                  {termValueIdx > 0 && ', '}
                                  <dd className="inline">{termValue.value}</dd>
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
              <section className="my-4">
                <div className="flex space-x-3 px-4">
                  <div className="relative px-2 pt-1.5 -mt-1 z-0">
                    <div className="bg-white shadow-sm border border-neutral-300 -m-px rounded-sm p-1 z-10">
                      <SparklesIcon className="text-neutral-500 w-4 h-4" />
                    </div>
                    <div className="absolute top-0 -bottom-1.5 left-5 -ml-px w-0.5 bg-neutral-200 -z-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex">
                      <div className="flex-1">
                        <div className="text-lg">
                          Features
                        </div>
                      </div>
                      <div className="pr-1.5">
                        <button
                          type="button"
                          className="uppercase inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 active:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                          onClick={() => setUiFlags(uiFlags => ({...uiFlags, showAllFeatures: !uiFlags.showAllFeatures}))}
                        >
                          {uiFlags.showAllFeatures ? 'Hide Unsupported' : 'Show All'}
                        </button>
                      </div>
                    </div>
                    <div className="flex mt-1.5 space-x-3">
                      <table>
                        <tbody>
                          {infoDescriptor.rootFeatures.filter(uiFlags.showAllFeatures ? v => true : v => v.supported).map(feature => (
                            <tr key={feature.name}>
                              <td className="align-top text-center">
                                {feature.supported
                                  ? (
                                    <div className="inline-flex items-center py-2">
                                      <CheckIcon className="h-5 w-5 text-sky-900" />
                                      <span className="sr-only ml-1">Supported</span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center py-2">
                                      <XMarkIcon className="h-5 w-5 text-red-900" />
                                      <span className="sr-only ml-1">Not Supported</span>
                                    </div>
                                  )}
                              </td>
                              <td className="align-top px-2 py-1.5">
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
            <ImageRequestBuilder infoDescriptor={infoDescriptor} />
          </div>
        )}
        {httpResponse && (
          <section>
            <button
              className={clsx(
                'p-1.5 flex items-center border-t w-full text-left text-xs font-mono hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-inset',
                uiFlags.showHttpResponse ? 'text-neutral-500 bg-neutral-100' : 'text-neutral-400 hover:bg-neutral-100'
              )}
              onClick={() => setUiFlags(uiFlags => ({...uiFlags, showHttpResponse: !uiFlags.showHttpResponse}))}
            >
              <ChevronRightIcon className={clsx('h-4 w-4 transition-transform duration-100', uiFlags.showHttpResponse && 'rotate-90')} />
              <span className="ml-1">info.json</span>
              <span className="mx-1">{' '}&middot;{' '}</span>
              <span>{httpResponse.httpStatus}{httpResponse.httpStatusText && ` ${httpResponse.httpStatusText}`}</span>
              {httpResponse.httpDuration && (
                <>
                  <span className="mx-1">{' '}&middot;{' '}</span>
                  <span>{httpResponse.httpDuration} ms</span>
                </>
              )}
            </button>
            {uiFlags.showHttpResponse && (
              <div className="bg-neutral-900 text-neutral-200 py-2 font-mono text-sm whitespace-pre overflow-x-auto space-y-2">
                <div className="px-2.5 flex text-neutral-400">
                  GET{' '}<span className="font-bold"><a className="underline" href={httpResponse.httpUrl}>{httpResponse.httpUrl}</a></span>
                </div>
                {httpResponse.requestHeaders.length > 0 && (
                  <div className="px-2.5 text-neutral-400">
                    {httpResponse.requestHeaders.map((nv, nvIdx) => (
                      <div key={nvIdx} className="flex space-x-2">
                        <span>&gt;</span>
                        <pre className="whitespace-pre-wrap"><code><span className="font-bold">{nv[0]}</span>: {nv[1]}</code></pre>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-2.5 flex text-neutral-400">
                  HTTP{' '}<span className="font-bold">{httpResponse.httpStatus}{httpResponse.httpStatusText && ` ${httpResponse.httpStatusText}`}</span>
                </div>
                {httpResponse.httpHeaders.length > 0 && (
                  <div className="px-2.5 relative text-neutral-400">
                    {httpResponse.httpHeaders.map((nv, nvIdx) => (
                      <div key={nvIdx} className="flex space-x-2">
                        <span>&lt;</span>
                        <pre className="whitespace-pre-wrap"><code><span className="font-bold">{nv[0]}</span>: {nv[1]}</code></pre>
                      </div>
                    ))}
                  </div>
                )}
                {httpResponse.httpBodyJson && (
                  <pre className="px-2.5"><code>{JSON.stringify(httpResponse.httpBodyJson, '\n', '\t')}</code></pre>
                )}
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="text-center text-neutral-600 text-xs px-4 my-4">
        <a className="underline" href="https://iiifimage.link/" rel="canonical">iiifimage.link</a>
        {' '}is{' '}
        <a className="underline" href="https://github.com/dpb587/iiifimage.link">open source</a>
        {' '}by{' '}
        <a className="underline" href="https://dpb587.me/">danny berger</a>
      </footer>
    </div>
  )
}

export default App
