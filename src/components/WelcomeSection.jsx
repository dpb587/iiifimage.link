import { LifebuoyIcon } from "@heroicons/react/20/solid";

const examples = [
  {
    imageUrl: "https://images.collections.yale.edu/iiif/2/ycba:cef381c4-9716-45e9-ac19-c8ee64808170",
    imageName: "Canvas of Cornfield at sunset",
    orgUrl: "https://collections.britishart.yale.edu/catalog/tms:511",
    orgName: "Yale Center for British Art",
  },
  {
    imageUrl: "https://iiif.ucd.ie/loris/ivrla:434",
    imageName: "Map of the City of Dublin",
    orgUrl: "https://digital.ucd.ie/view/ivrla:431",
    orgName: "UCD Digital Library",
  },
  {
    imageUrl: "https://tile.loc.gov/image-services/iiif/service:music:musbaseball:musbaseball-100028:musbaseball-100028.0001",
    imageName: "Music of Over the fence is out",
    orgUrl: "https://www.loc.gov/resource/musbaseball.100028.0/",
    orgName: "Library of Congress",
  },
  {
    imageUrl: "https://iiif.bodleian.ox.ac.uk/iiif/image/b62bca5b-d064-4ce9-b668-40eb98edbe92",
    imageName: "Portrait of Margaret Beaufort",
    orgUrl: "https://digital.bodleian.ox.ac.uk/objects/ab96d208-a553-45cc-b622-2c2210685119/",
    orgName: "Bodleian Library",
  },
];

function WelcomeSection({ setLocation }) {
  function doClick(e) {
    e.preventDefault();
    setLocation(e.target.href);
  }

  return (
    <section className="my-2 sm:my-5">
      <div className="flex px-3 sm:px-4">
        <div className="hidden sm:block relative z-0 -mt-1 mr-3 px-2 pt-1.5">
          <div className="z-10 -m-px rounded-sm border border-neutral-300 bg-white p-1 shadow-sm">
            <LifebuoyIcon className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="absolute top-0 -bottom-1 left-5 -z-10 -ml-px w-0.5 bg-neutral-200" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium">Links may be an image service, info.json, or image file URL.</div>
          <div className="mt-1.5 pt-0.5 leading-7 text-neutral-800">
            <p>
              Hello! This is a small tool to inspect metadata about IIIF images and demonstrate how their image
              file URLs may be constructed. Here are a few examples to try it out&hellip;
            </p>
            <ul className="my-2.5 ml-6 sm:ml-8 list-disc">
              {examples.map((example, exampleIdx) => (
                <li key={exampleIdx}>
                  <a
                    className="font-medium underline"
                    href={example.imageUrl}
                    target="_blank"
                    onClick={doClick}
                  >
                    {example.imageName}
                  </a>{" "}
                  from{" "}
                  <a
                    className="underline"
                    href={example.orgUrl}
                    target="_blank"
                  >
                    {example.orgName}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              You can learn more about the IIIF APIs from{" "}
              <a className="font-medium underline" href="https://iiif.io/api/" target="_blank">
                iiif.io
              </a>
              . This tool supports{" "}
              <a className="font-medium underline" href="https://iiif.io/api/image/2.1/" target="_blank">
                Version 2
              </a>{" "}
              and{" "}
              <a className="font-medium underline" href="https://iiif.io/api/image/3.0/" target="_blank">
                Version 3
              </a>{" "}
              of the Image API, but authentication-related workflows are not currently supported.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection
