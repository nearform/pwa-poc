let snapshotButton = document.querySelector('#capture-button')
let locationBtn = document.querySelector('#location-btn')
let canvasElement = document.querySelector('#canvas')
let videoPlayer = document.querySelector('#player')
let imagePickerArea = document.querySelector('#pick-image')
let shareButton = document.querySelector('#share-button')
let flipCameraButton = document.querySelector('#flip-camera-button')
let scanQRCode = document.querySelector('#qr-code-button')
let output = document.querySelector('#output')
let qrCodeBtn = document.querySelector('#qr-code-button')
let retryBtn = document.querySelector('#retry-btn')

const dataURItoBlob = (dataURI) => {
  /* converts the picture to a blob in javascript */
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], {type: mimeString});
  return blob;
}

let picture // global for loading the picture into memory
let front = false // bool value that specifies if the camera is facing front or back
const defaultConstraints = { video: { facingMode: (front ? 'user' : 'environment') }, audio: false }
// constraint object to specify default values for camera orientation

const init = (constraints = defaultConstraints) => {
  canvasElement.style.display = 'none'
  imagePickerArea.style.display = 'none'
  retryBtn.style.display = 'none'
  initializeMedia(constraints)
  initializeLocation()
}

const initializeLocation = () => {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none'
  }
}

const initializeMedia = (constraints) => {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {}
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = constraints => {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented!'))
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }

  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      if (videoDevices.length === 2) flipCameraButton.style.display = 'inline'
      else flipCameraButton.style.display = 'none'
    })
    .then(() =>
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream  => {
          videoPlayer.srcObject = stream
          videoPlayer.style.display = 'block'
        })
        .catch(err => {
          imagePickerArea.style.display = 'block'
        })
    )
}

const showButtons = () => {
  snapshotButton.style.display = 'inline'
  qrCodeBtn.style.display = 'inline'
  retryBtn.style.display = 'none'
}

const hideButtons = () => {
  videoPlayer.style.display = 'none'
  snapshotButton.style.display = 'none'
  qrCodeBtn.style.display = 'none'
  canvasElement.style.display = 'block'
  retryBtn.style.display = 'inline'
}

const hideBackdrop = event => backdrop.classList.remove('open')

const freezeFrame = () => {
  let context = canvasElement.getContext('2d')
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width))
  videoPlayer.srcObject.getVideoTracks().forEach(track => {
    track.stop()
  })
  return context
}

const clearPicture = () => {
  /* this clears the canvasElement and cleans up for returning to normal camera mode after
   * having taken a picture */
  picture = null
  const constraints = { video: { facingMode: (front ? 'user' : 'environment') } }
  init(constraints)
}

const snapshotHandler = event => {
  hideButtons()
  _ = freezeFrame()
  picture = dataURItoBlob(canvasElement.toDataURL('image/webp'))
}

const scanQRCodeHandler = event => {
  hideButtons()
  const context = freezeFrame()
  const currentImage = context.getImageData(0, 0, canvas.width, canvas.height)
  qrCode = new jsQR(currentImage.data, currentImage.width, currentImage.height);
  if (qrCode) {
    output.value = qrCode.data || 'No QR detected, try moving closer'
  } else {
    output.value = 'You need to scan the image first'
  }
}

const flipCameraHandler = event => {
  front = !front
  const constraints = { video: { facingMode: (front ? 'user' : 'environment') } }
  init(constraints)
  showButtons()
}

const getLocationHandler = event => {
  if (!('geolocation' in navigator)) {
    return
  }
  let sawAlert = false

  locationBtn.style.display = 'none'

  navigator.geolocation.getCurrentPosition(position => {
    locationBtn.style.display = 'inline'
    fetchedLocation = {lat: position.coords.latitude, lng: position.coords.longitude}
    output.value = `At Lat:${fetchedLocation.lat} and Long: ${fetchedLocation.lng}`
  }, err => {
    fetchedLocation = {lat: 0, lng: 0}
  }, {timeout: 7000})
}

const shareHandler = event => {
  if (!('share' in navigator)) {
    return
  }
  navigator.share({
    title: document.title,
    text: 'Hello from the fancy Snapshot PWA',
    url: 'https://example.com',
  })
  .then(() => console.log('Successfully shared the content'))
  .catch(err => console.log(`Failed to share because ${err.message}`))
}

const retryHandler = event => {
  showButtons()
  clearPicture()
}

retryBtn.addEventListener('click', retryHandler)
scanQRCode.addEventListener('click', scanQRCodeHandler)
shareButton.addEventListener('click', shareHandler)
snapshotButton.addEventListener('click', snapshotHandler)
flipCameraButton.addEventListener('click', flipCameraHandler)
locationBtn.addEventListener('click', getLocationHandler)
init()
