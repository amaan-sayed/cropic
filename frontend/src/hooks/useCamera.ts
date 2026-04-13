import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const streamRef = useRef<HTMLVideoElement>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Request environment facing camera (rear camera on mobile) for crop scanning
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      
      mediaStream.current = stream;
      if (streamRef.current) {
        streamRef.current.srcObject = stream;
      }
      setIsVideoActive(true);
    } catch (err) {
      console.error('Hardware access failure:', err);
      setIsVideoActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    if (streamRef.current) {
      streamRef.current.srcObject = null;
    }
    setIsVideoActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!streamRef.current || !isVideoActive) return null;

    const video = streamRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Return high-quality base64 image
      return canvas.toDataURL('image/jpeg', 0.95); 
    }
    return null;
  }, [isVideoActive]);

  // Safety cleanup: Ensure hardware turns off if component unmounts unexpectedly
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    startCamera,
    stopCamera,
    capturePhoto,
    isVideoActive,
    streamRef,
  };
};