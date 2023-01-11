import { Fragment, useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronRightIcon, CodeBracketIcon, CodeBracketSquareIcon, ExclamationCircleIcon, InformationCircleIcon, LifebuoyIcon, LinkIcon, PhotoIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid"
import './App.css'
import { fetchInfo } from './iiif/image/fetch'
import clsx from 'clsx'

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
      try {
        history.pushState("", document.title, window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = ''
      }
    }

    setUrlInput('')
    setHttpResponse(null)
    setInfoDescriptor(null)
  }

  function setAndReload(url, push) {
    setUrlInput(url)
    reload(url, push)
  }

  function reload(url, push) {
    if (push) {
      window.location.hash = `#${encodeURIComponent(url)}`
    }

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

    reload(urlInput, true)
  }

  function showExample(e, target) {
    e.preventDefault()

    setAndReload(target, true)
  }

  function hashchange() {
    const url = decodeURIComponent(window.location.hash.replace(/^#/, ''))

    if (url == '') {
      return reset(false)
    }

    setAndReload(url, false)
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
          <span className="font-medium">Inspect IIIF Image</span>
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
                placeholder="Paste a link about an IIIF image&hellip;"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                <button
                  type="submit"
                  className="uppercase inline-flex items-center rounded-sm border border-transparent bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 active:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
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
            <div className="flex space-x-3 px-4">
              <div className="relative px-2 pt-1.5 -mt-1 z-0">
                <div className="bg-white shadow-sm border border-neutral-300 -m-px rounded-sm p-1 z-10">
                  <LifebuoyIcon className="text-neutral-500 w-4 h-4" />
                </div>
                <div className="absolute top-0 -bottom-1 left-5 -ml-px w-0.5 bg-neutral-200 -z-10" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium">Links may be an image service, info.json, or image file URL.</div>
                <div className="mt-1.5 pt-0.5 text-neutral-700 leading-7">
                  <p>This is just a small tool that shows the metadata of <a className="font-medium underline" href="https://iiif.io/">IIIF</a> images and how their image file URLs may be constructed. Here are a few examples images to get you started&hellip;</p>
                  <ul className="list-disc mt-2 ml-5">
                    <li><a className="font-medium underline" href="https://images.collections.yale.edu/iiif/2/ycba:cef381c4-9716-45e9-ac19-c8ee64808170" onClick={(e) => showExample(e, 'https://images.collections.yale.edu/iiif/2/ycba:cef381c4-9716-45e9-ac19-c8ee64808170')}>Canvas of Cornfield at sunset</a> from <a className="underline" href="https://collections.britishart.yale.edu/catalog/tms:511" target="_blank">Yale Center for British Art</a></li>
                    <li><a className="font-medium underline" href="https://iiif.ucd.ie/loris/ivrla:434" onClick={(e) => showExample(e, 'https://iiif.ucd.ie/loris/ivrla:434')}>Map of the City of Dublin</a> from <a className="underline" href="https://digital.ucd.ie/view/ivrla:431" target="_blank">UCD Digital Library</a></li>
                    <li><a className="font-medium underline" href="https://tile.loc.gov/image-services/iiif/service:music:musbaseball:musbaseball-100028:musbaseball-100028.0001" onClick={(e) => showExample(e, 'https://tile.loc.gov/image-services/iiif/service:music:musbaseball:musbaseball-100028:musbaseball-100028.0001')}>Music of Over the fence is out</a> from <a className="underline" href="https://www.loc.gov/resource/musbaseball.100028.0/" target="_blank">Library of Congress</a></li>
                    <li><a className="font-medium underline" href="https://iiif.bodleian.ox.ac.uk/iiif/image/b62bca5b-d064-4ce9-b668-40eb98edbe92" onClick={(e) => showExample(e, 'https://iiif.bodleian.ox.ac.uk/iiif/image/b62bca5b-d064-4ce9-b668-40eb98edbe92')}>Portrait of Margaret Beaufort</a> from <a className="underline" href="https://digital.bodleian.ox.ac.uk/objects/ab96d208-a553-45cc-b622-2c2210685119/" target="_blank">Bodleian Library</a></li>
                  </ul>
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
              {httpResponse.httpDuration && (
                <>
                  <span className="mx-1">{' '}&middot;{' '}</span>
                  <span>{httpResponse.httpDuration} ms</span>
                </>
              )}
            </button>
            {uiFlags.showHttpResponse && (
              <div className="bg-neutral-900 text-neutral-200 py-2">
                <div className="px-4 relative text-neutral-400">
                  <div className="absolute left-3 inset-y-0 w-0.5 bg-neutral-400 rounded-full" />
                  {httpResponse.httpHeaders.map((nv, nvIdx) => (
                    <div key={nvIdx} className="pl-2.5"><code>{nv[0]}: {nv[1]}</code></div>
                  ))}
                </div>
                {httpResponse.httpBodyJson && (
                  <pre className="p-2 overflow-x-auto"><code>{JSON.stringify(httpResponse.httpBodyJson, '\n', '\t')}</code></pre>
                )}
              </div>
            )}
          </section>
        )}
      </main>
      <footer className="text-center text-neutral-500 text-xs px-4 my-4">
        <a className="hover:underline" href="https://iiifimage.link/" rel="canonical">iiifimage.link</a>
        {' '}is{' '}
        <a className="hover:underline" href="https://github.com/dpb587/iiifimage.link">open source</a>
        {' '}by{' '}
        <a className="hover:underline" href="https://dpb587.me/">danny berger</a>
      </footer>
    </div>
  )
}

export default App
