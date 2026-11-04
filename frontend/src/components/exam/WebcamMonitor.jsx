import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, Eye, RefreshCw, Maximize2, Minimize2, CheckCircle2, Wifi } from 'lucide-react';
import { useExam } from '../../context/ExamContext';

export const WebcamMonitor = ({ isCompact = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);

  const {
    activeSession,
    cameraActive,
    setCameraActive,
    cameraPermissionGranted,
    setCameraPermissionGranted,
    triggerTelemetryAlert,
  } = useExam();

  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [telemetry, setTelemetry] = useState({
    fps: 5.0,
    yaw: 0.0,
    pitch: 0.0,
    roll: 0.0,
    faceCount: 1,
    status: 'NORMAL', // NORMAL, LOOKING_AWAY, ABSENCE, VIOLATION
    detectedObjects: [],
  });

  const [expanded, setExpanded] = useState(!isCompact);

  // Initialize camera
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { max: 15 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasPermission(true);
      setCameraPermissionGranted(true);
      setCameraActive(true);
      setIsSimulated(false);
    } catch (err) {
      console.warn('Real webcam not accessible, enabling simulated video feed:', err);
      setError('Webcam unavailable or permission blocked. Simulation fallback active.');
      setHasPermission(false);
      setIsSimulated(true);
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Connect WebSocket for real Computer Vision streaming
  useEffect(() => {
    const sessionId = activeSession?.id || 'ses-101';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/ws/proctor/${sessionId}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'telemetry') {
            const pose = msg.head_pose || {};
            setTelemetry((prev) => ({
              ...prev,
              fps: msg.fps || prev.fps,
              yaw: pose.yaw ?? prev.yaw,
              pitch: pose.pitch ?? prev.pitch,
              roll: pose.roll ?? prev.roll,
              faceCount: msg.face_count ?? prev.faceCount,
              status: msg.status === 'COMPLIANT' ? 'NORMAL' : msg.status,
              detectedObjects: msg.detected_objects || [],
            }));

            if (msg.new_incidents > 0) {
              triggerTelemetryAlert('AI Flagged Event', 'Sustained behavioural anomaly recorded.');
            }
          }
        } catch (e) {
          console.warn('Telemetry parse error', e);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch (err) {
      console.warn('WebSocket connection error', err);
      setWsConnected(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeSession]);

  // Frame streaming & Canvas rendering loop
  useEffect(() => {
    if (!cameraActive) return;

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = 320;
    captureCanvas.height = 240;
    const captureCtx = captureCanvas.getContext('2d');

    const interval = setInterval(() => {
      // 1. If camera has permission and video is playing, send real frame to WebSocket
      if (hasPermission && videoRef.current && videoRef.current.readyState >= 2) {
        try {
          captureCtx.drawImage(videoRef.current, 0, 0, 320, 240);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const frameBase64 = captureCanvas.toDataURL('image/jpeg', 0.65);
            wsRef.current.send(JSON.stringify({ type: 'frame', image: frameBase64 }));
          }
        } catch (e) {
          // Frame capture failed
        }
      } else if (isSimulated && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        // Fallback simulated natural movements if backend or camera offline
        const randomYaw = +(Math.sin(Date.now() / 3000) * 8 + (Math.random() - 0.5) * 4).toFixed(1);
        const randomPitch = +(Math.cos(Date.now() / 4000) * 5 + (Math.random() - 0.5) * 2).toFixed(1);
        const randomRoll = +(Math.sin(Date.now() / 5000) * 3).toFixed(1);

        let status = 'NORMAL';
        if (Math.abs(randomYaw) > 25.0) status = 'LOOKING_AWAY';

        setTelemetry((prev) => ({
          ...prev,
          yaw: randomYaw,
          pitch: randomPitch,
          roll: randomRoll,
          status,
          fps: +(5.0 + Math.random() * 0.4).toFixed(1),
        }));
      }

      // 2. Draw overlay tracking markings on preview canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        const currentStatus = telemetry.status;
        if (currentStatus === 'NORMAL') {
          // Bounding box: Emerald
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          const boxW = w * 0.45;
          const boxH = h * 0.6;
          const boxX = (w - boxW) / 2 + (telemetry.yaw || 0) * 1.5;
          const boxY = (h - boxH) / 2 + (telemetry.pitch || 0) * 1.2;

          ctx.strokeRect(boxX, boxY, boxW, boxH);

          // Face landmark points preview
          ctx.fillStyle = '#34D399';
          const points = [
            [boxX + boxW * 0.5, boxY + boxH * 0.45], // Nose
            [boxX + boxW * 0.3, boxY + boxH * 0.35], // Left Eye
            [boxX + boxW * 0.7, boxY + boxH * 0.35], // Right Eye
            [boxX + boxW * 0.5, boxY + boxH * 0.75], // Mouth
          ];
          points.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
          });
        } else if (currentStatus === 'LOOKING_AWAY') {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(w * 0.15, h * 0.15, w * 0.7, h * 0.7);
        } else if (currentStatus === 'VIOLATION' || currentStatus === 'ABSENT') {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [cameraActive, hasPermission, isSimulated, telemetry.status, telemetry.yaw, telemetry.pitch]);

  return (
    <div
      className={`bg-navy-900 border border-navy-700/80 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
        expanded ? 'w-72' : 'w-48'
      }`}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-navy-950 flex items-center justify-center overflow-hidden">
        {/* Real HTML5 Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform scale-x-[-1] ${
            !hasPermission ? 'hidden' : 'block'
          }`}
        />

        {/* Simulation placeholder if camera unavailable */}
        {!hasPermission && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-navy-900 to-navy-950">
            <div className="relative w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-2">
              <Camera className="w-8 h-8 text-blue-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200">AI Telemetry Active</p>
            <p className="text-[10px] text-slate-400 mt-1">Virtual Face Tracker Emulation</p>
          </div>
        )}

        {/* Overlay Canvas for CV landmark drawing */}
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md border border-navy-700 text-[10px] font-medium text-slate-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                telemetry.status === 'NORMAL' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span>{isSimulated ? 'Simulated' : 'Webcam Live'}</span>
            {wsConnected && (
              <span className="text-[9px] text-emerald-400 font-mono ml-0.5" title="Connected to Backend WebSocket">
                (WS)
              </span>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="pointer-events-auto p-1 rounded bg-navy-900/80 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
            title={expanded ? 'Minimize' : 'Expand'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Status Alert Banner overlay when looking away */}
        {telemetry.status === 'LOOKING_AWAY' && (
          <div className="absolute bottom-2 inset-x-2 bg-amber-950/90 border border-amber-500/60 rounded-lg p-1.5 flex items-center gap-2 text-[11px] text-amber-200 backdrop-blur-md animate-bounce">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium">Head gaze turned ({telemetry.yaw}°)</span>
          </div>
        )}
      </div>

      {/* Expanded Telemetry Details */}
      {expanded && (
        <div className="p-3 bg-navy-900/90 border-t border-navy-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Head Pose (Yaw/Pitch)</span>
            <span className="font-mono font-medium text-slate-200">
              {telemetry.yaw}° / {telemetry.pitch}°
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Sample Ingestion</span>
            <span className="font-mono text-emerald-400 font-semibold">{telemetry.fps} FPS</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Persons in Frame</span>
            <span className="text-slate-200 font-medium">{telemetry.faceCount} Verified</span>
          </div>

          {error && (
            <button
              onClick={startCamera}
              className="w-full mt-1 py-1 px-2 rounded bg-navy-800 hover:bg-navy-700 text-blue-400 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Physical Camera</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
