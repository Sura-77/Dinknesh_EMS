import { useState, useEffect, useRef } from 'react';
import { Scan, CheckCircle, XCircle, TrendingUp, Camera, CameraOff, Keyboard } from 'lucide-react';
import { api as mockApi } from '../services/api';

import { motion } from 'motion/react';


export function SecurityScanner() {
  const [inputMode, setInputMode] = useState('camera');
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [qrCode, setQrCode] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    loadStats();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (inputMode === 'camera') {
      requestCamera();
    } else {
      stopCamera();
    }
  }, [inputMode]);

  const loadStats = async () => {
    try {
      const mockStats = await mockApi.getEventStatsForSecurity('1');
      setStats(mockStats);
    } catch {}
  };

  const requestCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      return;
    }
    setCameraStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStatus('active');
      startScanLoop();
    } catch (err) {
      setCameraStatus(err.name === 'NotAllowedError' ? 'denied' : 'unsupported');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraStatus('idle');
  };

  // Simulate QR detection from camera frame (real implementation would use jsQR or ZXing)
  const startScanLoop = () => {
    // In production: use jsQR library to decode frames from a canvas
    // For now the camera shows live feed and user can also type the code
    scanIntervalRef.current = setInterval(() => {
      // placeholder â€” real QR decode would go here
    }, 500);
  };

  const handleScan = async (code) => {
    const ticketCode = code || qrCode;
    if (!ticketCode.trim()) return;
    setScanning(true);
    setScanResult(null);
    try {
      const result = await mockApi.scanTicket(ticketCode);
      setScanResult({
        success: result.success,
        message: result.success ? 'Valid Ticket' : result.scan_result === 'already_scanned' ? 'Already Scanned' : 'Invalid Ticket',
        ticketInfo: result.ticket_info,
      });
      if (result.success) setTimeout(loadStats, 1000);
    } catch {
      setScanResult({ success: false, message: 'Scan Failed' });
    } finally {
      setScanning(false);
      setQrCode('');
    }
  };

  const progressPercentage = stats ? (stats.checked_in_total / Math.max(stats.tickets_sold_total, 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold mb-2">DEMS Scanner</div>
          <div className="h-1 w-24 mx-auto mb-4 flex rounded-full overflow-hidden">
            <div className="flex-1 bg-green-500" /><div className="flex-1 bg-yellow-400" /><div className="flex-1 bg-red-500" />
          </div>
          <p className="text-gray-400">Scan tickets for event entry</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-xl">
          <button onClick={() => setInputMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${inputMode === 'camera' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}>
            <Camera className="size-4" /> Camera Scan
          </button>
          <button onClick={() => setInputMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${inputMode === 'manual' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}>
            <Keyboard className="size-4" /> Manual Entry
          </button>
        </div>

        {/* Scanner Area */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          {inputMode === 'camera' ? (
            <div className="space-y-4">
              {/* Camera viewport */}
              <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700">
                {cameraStatus === 'active' && (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Scan frame overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative size-56">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                        <motion.div
                          className="absolute left-2 right-2 h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)]"
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    </div>
                    {/* Scan result overlay */}
                    {scanResult && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`absolute inset-0 flex flex-col items-center justify-center ${scanResult.success ? 'bg-green-900/80' : 'bg-red-900/80'}`}>
                        {scanResult.success ? <CheckCircle className="size-20 text-green-400 mb-3" /> : <XCircle className="size-20 text-red-400 mb-3" />}
                        <div className="text-2xl font-bold mb-2">{scanResult.message}</div>
                        {scanResult.ticketInfo && (
                          <div className="text-sm text-center text-gray-300 space-y-1">
                            <div>{scanResult.ticketInfo.ticket_tier} Ticket</div>
                            <div>{scanResult.ticketInfo.attendee_name}</div>
                          </div>
                        )}
                        <button onClick={() => setScanResult(null)} className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30">
                          Scan Next
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {cameraStatus === 'requesting' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin size-10 border-4 border-gray-600 border-t-white rounded-full" />
                    <p className="text-gray-400 text-sm">Requesting camera access...</p>
                  </div>
                )}

                {cameraStatus === 'denied' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <CameraOff className="size-16 text-red-400" />
                    <div>
                      <p className="font-semibold text-red-400 mb-1">Camera Access Denied</p>
                      <p className="text-sm text-gray-400">Please allow camera access in your browser settings, then refresh the page.</p>
                    </div>
                    <button onClick={requestCamera} className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100">
                      Try Again
                    </button>
                  </div>
                )}

                {cameraStatus === 'unsupported' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <CameraOff className="size-16 text-gray-500" />
                    <p className="text-gray-400 text-sm">Camera not supported on this device. Use manual entry.</p>
                  </div>
                )}

                {cameraStatus === 'idle' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Camera className="size-16 text-gray-600" />
                    <button onClick={requestCamera} className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100">
                      Enable Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Also allow typing while camera is active */}
              {cameraStatus === 'active' && (
                <div className="flex gap-2">
                  <input type="text" value={qrCode} onChange={e => setQrCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScan()}
                    placeholder="Or type ticket code..."
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white font-mono text-sm" />
                  <button onClick={() => handleScan()} disabled={!qrCode.trim() || scanning}
                    className="px-4 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50">
                    Scan
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Manual entry mode */
            <div className="space-y-4">
              <div className="aspect-square bg-gray-700/50 rounded-xl border-4 border-dashed border-gray-600 flex items-center justify-center">
                {scanning ? (
                  <motion.div className="absolute inset-0 bg-blue-500/20 rounded-xl"
                    animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }} />
                ) : scanResult ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`flex flex-col items-center gap-4 ${scanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {scanResult.success ? <CheckCircle className="size-24" /> : <XCircle className="size-24" />}
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{scanResult.message}</div>
                      {scanResult.ticketInfo && (
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>{scanResult.ticketInfo.ticket_tier} Ticket</div>
                          <div>{scanResult.ticketInfo.attendee_name}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <Scan className="size-24 text-gray-500" />
                )}
              </div>
              <input type="text" value={qrCode} onChange={e => setQrCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="Enter ticket code or scan QR..."
                className="w-full px-4 py-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white text-center text-lg font-mono"
                disabled={scanning} autoFocus />
              <button onClick={() => handleScan()} disabled={scanning || !qrCode.trim()}
                className="w-full px-6 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 text-lg">
                {scanning ? 'Scanning...' : 'Scan Ticket'}
              </button>
            </div>
          )}
        </div>

        {/* Live Stats */}
        {stats && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-5 text-green-400" />
              <h2 className="text-xl font-bold">Live Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Expected</div>
                <div className="text-3xl font-bold">{stats.tickets_sold_total}</div>
                <div className="text-xs text-gray-500">Tickets Sold</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Checked In</div>
                <div className="text-3xl font-bold text-green-400">{stats.checked_in_total}</div>
                <div className="text-xs text-gray-500">Attendees</div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Capacity Progress</span>
                <span className="text-sm font-semibold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Normal', val: stats.normal_sold }, { label: 'VIP', val: stats.vip_sold }, { label: 'VVIP', val: stats.vvip_sold }].map(s => (
                <div key={s.label} className="bg-gray-700/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{s.val}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

