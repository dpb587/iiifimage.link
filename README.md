# iiifimage.link

This is a small tool to inspect metadata about IIIF images and demonstrate how their image file URLs may be constructed. It is deployed to [iiifimage.link](https://iiifimage.link/).

You can learn more about the IIIF APIs from [iiif.io](https://iiif.io/api/). This tool supports [Version 2](https://iiif.io/api/image/2.1/) and [Version 3](https://iiif.io/api/image/3.0/) of the Image API, but authentication-related workflows are not currently supported.

Some notes...

* the image request parameters builder is conditional on the image service features
* there are a variety of server behaviors and this might still be missing a couple scenarios
* bug reports and feedback is welcome &ndash; feel free to start an issue

## License

[MIT License](LICENSE)
