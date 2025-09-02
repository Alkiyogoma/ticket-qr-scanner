
export const useQRScanner = () => {
    const scannerStore = useScannerStore()
    let videoStream = null
    let canvas = null
    let context = null
    let animationFrame = null

    const initScanner = async () => {
        try {
            // Check if we have camera access
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = devices.filter(device => device.kind === 'videoinput')

            if (videoDevices.length === 0) {
                throw new Error('No camera devices found')
            }

            return videoDevices
        } catch (error) {
            console.error('Failed to initialize scanner:', error)
            throw error
        }
    }

    const startScanning = async (videoElementId, onResult) => {
        try {
            scannerStore.setScanning(true)

            const video = document.getElementById(videoElementId)
            if (!video) {
                throw new Error('Video element not found')
            }

            // Get camera constraints - prefer back camera
            const constraints = {
                video: {
                    facingMode: 'environment', // Back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            }

            try {
                videoStream = await navigator.mediaDevices.getUserMedia(constraints)
            } catch (backCameraError) {
                // Fallback to any camera
                console.warn('Back camera not available, using default:', backCameraError)
                videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
            }

            video.srcObject = videoStream

            // Wait for video to load
            await new Promise((resolve) => {
                video.onloadedmetadata = resolve
            })

            await video.play()

            // Create canvas for QR code detection
            canvas = document.createElement('canvas')
            context = canvas.getContext('2d')

            // Start scanning loop
            scanLoop(video, onResult)

        } catch (error) {
            console.error('Failed to start scanning:', error)
            scannerStore.setScanning(false)
            throw error
        }
    }

    const scanLoop = (video, onResult) => {
        if (!scannerStore.isScanning || !video.videoWidth || !video.videoHeight) {
            animationFrame = requestAnimationFrame(() => scanLoop(video, onResult))
            return
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        // Try to decode QR code
        try {
            // Import jsQR dynamically to avoid SSR issues
            import('jsqr').then(({ default: jsQR }) => {
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                })

                if (code && code.data) {
                    scannerStore.setScanResult(code.data)
                    onResult(code.data)
                    stopScanning() // Stop after successful scan
                    return
                }

                // Continue scanning if no code found
                if (scannerStore.isScanning) {
                    animationFrame = requestAnimationFrame(() => scanLoop(video, onResult))
                }
            }).catch(error => {
                console.error('jsQR import error:', error)
                // Continue scanning even if jsQR fails to import
                if (scannerStore.isScanning) {
                    animationFrame = requestAnimationFrame(() => scanLoop(video, onResult))
                }
            })
        } catch (error) {
            console.error('QR scan error:', error)
            // Continue scanning
            if (scannerStore.isScanning) {
                animationFrame = requestAnimationFrame(() => scanLoop(video, onResult))
            }
        }
    }

    const stopScanning = () => {
        scannerStore.setScanning(false)

        // Cancel animation frame
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
            animationFrame = null
        }

        // Stop video stream
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop())
            videoStream = null
        }

        // Clear video element
        const video = document.querySelector('video')
        if (video) {
            video.srcObject = null
        }
    }

    // Cleanup on unmount
    onUnmounted(() => {
        stopScanning()
    })

    return {
        initScanner,
        startScanning,
        stopScanning
    }
}