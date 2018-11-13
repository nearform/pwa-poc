let snapshotButton = document.querySelector('#capture-button')
let locationInput = document.querySelector('#location')
let locationBtn = document.querySelector('#location-btn')
let locationLoader = document.querySelector('#location-loader')
let canvasElement = document.querySelector('#canvas')
let videoPlayer = document.querySelector('#player')
let imagePickerArea = document.querySelector('#pick-image')
let shareButton = document.querySelector('#share-button')
let flipCameraButton = document.querySelector('#flip-camera-button')

let picture
let front = false

const init = () => {
  locationLoader.style.display = 'none'
  canvasElement.style.display = 'none'
  imagePickerArea.style.display = 'none'
  const constraints = { video: { facingMode: (front ? 'user' : 'environment') }, audio: false }
  initializeMedia(constraints)
  initializeLocation()
}

const dataURItoBlob = (dataURI) => {
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

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream  => {
      videoPlayer.srcObject = stream
      videoPlayer.style.display = 'block'
    })
    .catch(err => {
      imagePickerArea.style.display = 'block'
    })
}

const snapshotHandler = event => {
  canvasElement.style.display = 'block'
  videoPlayer.style.display = 'none'
  snapshotButton.style.display = 'none'
  let context = canvasElement.getContext('2d')
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width))
  videoPlayer.srcObject.getVideoTracks().forEach(track => {
    track.stop()
  })
  picture = dataURItoBlob(canvasElement.toDataURL('image/webp'))
}

const flipCameraHandler = event => {
  front = !front
  const constraints = { video: { facingMode: (front ? 'user' : 'environment') } }
  initializeMedia(constraints)
}

const getLocationHandler = event => {
  if (!('geolocation' in navigator)) {
    return
  }
  let sawAlert = false

  locationBtn.style.display = 'none'
  locationLoader.style.display = 'block'

  navigator.geolocation.getCurrentPosition(position => {
    locationBtn.style.display = 'inline'
    locationLoader.style.display = 'none'
    fetchedLocation = {lat: position.coords.latitude, lng: position.coords.longitude}
    locationInput.value = `At ${fetchedLocation.lat} latitude and ${fetchedLocation.lng} longitude`
  }, err => {
    locationBtn.style.display = 'inline'
    locationLoader.style.display = 'none'
    if (!sawAlert) {
      console.error('Couldnt fetch location, please enter manually!')
      sawAlert = true
    }
    fetchedLocation = {lat: 0, lng: 0}
  }, {timeout: 7000})
}

const shareHandler = event => {
  if (!('share' in navigator)) {
    return
  }
  navigator.share({
    title: document.title,
    text: 'Hello from sharing',
    url: 'https://developer.mozilla.org',
  });
}

shareButton.addEventListener('click', shareHandler)
snapshotButton.addEventListener('click', snapshotHandler)
flipCameraButton.addEventListener('click', flipCameraHandler)
locationBtn.addEventListener('click', getLocationHandler)
init()
