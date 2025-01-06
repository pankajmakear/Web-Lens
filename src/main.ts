import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const flipCamera = document.getElementById('flip') as HTMLButtonElement;

let isBackFacing = true;
let mediaStream: MediaStream;

async function init() {
  const cameraKit = await bootstrapCameraKit({
    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzMzMzc1OTY3LCJzdWIiOiIyM2U5NWFlZS0yNTRlLTRhYmYtYTk2MS1lNzBhOTNhZjRiM2N-U1RBR0lOR35jZTc4MmNjNC0zOGEwLTQ3YmUtOTU5NC00MjE4YWJlYjZkMzYifQ.5GMvAjVQ8v2dmDhps1OWei4rxn0Ba0jCnEhth9M7RiA',
  });

  const session = await cameraKit.createSession({ liveRenderTarget });
  const lens = await cameraKit.lensRepository.loadLens(
    '43300180875',
    'ba31da6f-8bda-4b19-9ea7-ca7ff23e9931'
  );

  session.applyLens(lens);

  bindFlipCamera(session);
}

function bindFlipCamera(session: CameraKitSession) {
  flipCamera.style.cursor = 'pointer';

  flipCamera.addEventListener('click', () => {
    updateCamera(session);
  });

  updateCamera(session);
}

async function updateCamera(session: CameraKitSession) {
  isBackFacing = !isBackFacing;

  flipCamera.innerText = isBackFacing
    ? 'Switch to Front Camera'
    : 'Switch to Back Camera';

  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: isBackFacing ? 'environment' : 'user',
    },
  });

  const source = createMediaStreamSource(mediaStream, {
    // NOTE: This is important for world facing experiences
    cameraType: isBackFacing ? 'environment' : 'user',
  });

  await session.setSource(source);

  if (!isBackFacing) {
    source.setTransform(Transform2D.MirrorX);
  }

  session.play();
}

init();