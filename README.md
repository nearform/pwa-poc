# PWA Advanced features application

## Why:

We want to understand what native features in an application can be ported over to a PWA.

The targeted features for this are:
 - Camera access + taking pictures
 - Geolocation
 - Native Share capabilities
 - QR Code Scanning


## Prerequisites:

This is a very simple vanillaJS implementation

The styles are a light version of material-design.

The only requirement for `npm` and npm scripts in our case is for starting up an http server (the `http-server` package in our case)

### Running locally:
```bash
git clone git@github.com:nearform/pwa-poc.git
cd pwa-poc
npm i
npm start
```

You will have an `HTTP` server running locally and over the `LAN` however for the page to work on the device fully it should be served over `HTTPS`.

## For deploying:
Any static hosting should work since they provide mechanisms for serving static content. The content will need to be served over `HTTPS` otherwise chrome will block it.

No build step required as it is plain JS.

## Implementation:

## Stage 1
### I. Picture capture and sharing:

1) For the geo location the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation) was used.
This API has [fairly wide spread adoption](https://caniuse.com/#search=geolocation) across browsers

2) For taking pictures and getting the resulting image the [`navigator.mediaDevices API`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/mediaDevices) was used. This too has [decent support](https://caniuse.com/#feat=mediacapture-fromelement) for most modern browsers, but we can see that for iOS the support is not as good as for the other browsers.

3) For sharing using the native provided menu the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) was used however for our purposes this has [limitations](https://caniuse.com/#feat=web-share).
  - Support is only available in Chrome and Safari Tech Preview which makes it unlikely that it would work on most clients.
  - Another downside of this is that it does not seem to work for [sharing image objects](https://github.com/WICG/web-share/issues/12)



## Other potential limitations:
1) The native camera app usually goes to postprocessing after a picture has been taken. With the PWA approach this is not the case as the image is captured to canvas then put into a `blob` type object so the post processing will no longer happen so quality/image filters may differ from what the native camera app shows. This is however the case with most native apps used.

## Findings and Conclusions:
1) The Web Share API is not currently mature enough.
    - not widely compatible with browsers (Chrome, Safari Tech Preview)
    - does not allow for sharing images (only text content)
    
    `eg:`
    ```javascript
    navigator.share({
      title: document.title,
      text: 'Hello from sharing',
      url: '<url goes here>',
    });
    ```
    - markup option is not available when sharing via email (it would require a 3rd party email server to set the proper headers)
    - could work only if images are uploaded to a 3rd party and the link is provided

2) WebRTC investigation showed that the protocol is a P2P protocol and it would require a 3rd party service to buffer the files, and is connection based so it is not very much in line with how a `serviceWorker` functions. It is not a viable solution for the task as it requires a connection oriented protocol for communication.

3) There is a way to share content via Deep Links to each of the apps mentioned. The caveats with this are:
    - the share menu is not the native one, it will be part of the web app
    - the sharing options are hard coded in the site so people will not have the same menu as they would normally have in their share context natively (ie: some people may have Twitter as their goto for sharing instead of facebook)
    - this allows for sending **links only**
    - it has cross platform compatibility, better than the web share API so it can be a good fallback for lacking Web Share API support on iOS
    - could work only if images are uploaded to a 3rd party and the link is provided

## Stage 2

### II. QR Code Scanning:

1) We used a very good QR code/barcode scanning library called [ZXing](https://github.com/zxing/zxing) with a more recent port to JS, [jsQR](https://github.com/cozmo/jsQR). `jsQR` is only targeted at reading the QR codes, so much lighter than the `ZXing` lib. The way it works:
   - select the camera you wish to scan with on the device
   - point it at the QR code
   - tap the scan QR code and if the QR code is detected in the image the input below will be populated with the decoded value
   - otherwise you need to tap the retry button to get back into picture taking mode and try again.
  
2) Some improvements on this:
   - the video feed continuously checks if a QR code is detected and prints out the decoding if it is
   - the video feed has a visual cue when a QR code is detected so that you can take the snapshot

3) The implementation is very similar to the picture taking except in the QR code case the goal is retrieving the code in the QR image.

## Conclusion:
1) This is a very workable solution and for prototype purposes it worked as expected.
2) The range at which the QR code is detected is not very big (10-20cm for a 200x200px QR code)


## Stage 3
## TBD