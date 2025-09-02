
import { BrowserQRCodeReader } from '@zxing/library'

export const useQRScanner = () => {
    const scannerStore = useScannerStore()
    let codeReader = null
    let selectedDeviceId = null

    const initScanner = async () => {
        try {
            codeReader = new BrowserQRCodeReader()
            const videoInputDevices = await codeReader.listVideoInputDevices()

            // Prefer back camera
            const backCamera = videoInputDevices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear')
            )

            selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0]?.deviceId

            return videoInputDevices
        } catch (error) {
            console.error('Failed to initialize scanner:', error)
            throw error
        }
    }

    const startScanning = async (videoElementId, onResult) => {
        if (!codeReader) {
            await initScanner()
        }

        try {
            scannerStore.setScanning(true)

            const result = await codeReader.decodeOnceFromVideoDevice(
                selectedDeviceId,
                videoElementId
            )

            if (result) {
                scannerStore.setScanResult(result.text)
                onResult(result.text)
            }
        } catch (error) {
            console.error('Scanning error:', error)
            throw error
        } finally {
            scannerStore.setScanning(false)
        }
    }

    const stopScanning = () => {
        if (codeReader) {
            codeReader.reset()
            scannerStore.setScanning(false)
        }
    }

    return {
        initScanner,
        startScanning,
        stopScanning
    }
}