import {
  DataCaptureView,
  Camera,
  DataCaptureContext,
  configure,
  CameraSwitchControl,
  RectangularViewfinder,
  RectangularViewfinderStyle,
  RectangularViewfinderLineStyle,
  FrameSourceState,
} from 'scandit-web-datacapture-core';
import type {
  SymbologySettings,
  Barcode,
  BarcodeCaptureSession,
} from 'scandit-web-datacapture-barcode';
import {
  barcodeCaptureLoader,
  BarcodeCapture,
  BarcodeCaptureSettings,
  Symbology,
  BarcodeCaptureOverlay,
  BarcodeCaptureOverlayStyle,
  SymbologyDescription,
} from 'scandit-web-datacapture-barcode';

declare global {
  interface Window {
    continueScanning: () => Promise<void>;
  }
}

let context: DataCaptureContext;
let barcodeCapture: BarcodeCapture;
let barcodeCaptureOverlay: BarcodeCaptureOverlay;
let viewfinder: RectangularViewfinder;
let view: DataCaptureView;

export async function initializeScanner(
  setResult: (result: string) => void
): Promise<void> {
  view = new DataCaptureView();
  view.connectToElement(document.getElementById('data-capture-view')!);
  view.showProgressBar();

  await configure({
    licenseKey: '-- ENTER YOUR SCANDIT LICENSE KEY HERE --',
    libraryLocation: new URL('library/engine/', document.baseURI).toString(),
    moduleLoaders: [barcodeCaptureLoader()],
  });

  view.setProgressBarPercentage(null);
  view.setProgressBarMessage('Accessing Camera...');

  context = await DataCaptureContext.create();
  await view.setContext(context);

  const camera: Camera = Camera.default;
  const cameraSettings = BarcodeCapture.recommendedCameraSettings;
  await camera.applySettings(cameraSettings);
  await context.setFrameSource(camera);

  const settings: BarcodeCaptureSettings = new BarcodeCaptureSettings();
  settings.enableSymbologies([Symbology.QR, Symbology.PDF417]);

  barcodeCapture = await BarcodeCapture.forContext(context, settings);
  await barcodeCapture.setEnabled(false);

  view.addControl(new CameraSwitchControl());

  barcodeCaptureOverlay =
    await BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
      barcodeCapture,
      view,
      BarcodeCaptureOverlayStyle.Frame
    );

  barcodeCapture.addListener({
    didScan: async (
      barcodeCaptureMode: BarcodeCapture,
      session: BarcodeCaptureSession
    ) => {
      const barcode: Barcode = session.newlyRecognizedBarcodes[0];
      const symbology: SymbologyDescription = new SymbologyDescription(
        barcode.symbology
      );
      setResult(`Scanned: ${barcode.data ?? ''}\n(${symbology.readableName})`);
    },
  });

  viewfinder = new RectangularViewfinder(
    RectangularViewfinderStyle.Square,
    RectangularViewfinderLineStyle.Light
  );
  await barcodeCaptureOverlay.setViewfinder(viewfinder);

  await camera.switchToDesiredState(FrameSourceState.On);
  await barcodeCapture.setEnabled(true);
  view.hideProgressBar();
}

export async function startScanner(): Promise<void> {
  await barcodeCapture.setEnabled(true);
}

export async function stopScanner(): Promise<void> {
  await barcodeCapture.setEnabled(false);
}

window.continueScanning = async function () {
  await startScanner();
};
