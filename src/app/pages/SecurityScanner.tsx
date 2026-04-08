import { useState, useEffect } from 'react';
import { Scan, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import type { EventStats } from '../types';
import { motion } from 'motion/react';

export function SecurityScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticketInfo?: any;
  } | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Mock event ID
      const mockStats = await mockApi.getEventStatsForSecurity('1');
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleScan = async () => {
    if (!qrCode.trim()) return;

    setScanning(true);
    setScanResult(null);

    try {
      const result = await mockApi.scanTicket(qrCode);
      
      if (result.success) {
        setScanResult({
          success: true,
          message: 'Valid Ticket',
          ticketInfo: result.ticket_info,
        });
        // Reload stats after successful scan
        setTimeout(loadStats, 1000);
      } else {
        setScanResult({
          success: false,
          message: result.scan_result === 'already_scanned' ? 'Already Scanned' : 'Invalid Ticket',
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Scan Failed',
      });
    } finally {
      setScanning(false);
      setQrCode('');
    }
  };

  const progressPercentage = stats
    ? (stats.checked_in_total / stats.tickets_sold_total) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-3xl font-bold mb-2">DEMS Scanner</div>
          <div className="h-1 w-24 mx-auto mb-4 flex rounded-full overflow-hidden">
            <div className="flex-1 bg-green-500" />
            <div className="flex-1 bg-yellow-400" />
            <div className="flex-1 bg-red-500" />
          </div>
          <p className="text-gray-400">Scan tickets for event entry</p>
        </div>

        {/* Scanner Area */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <div className="aspect-square bg-gray-700/50 rounded-xl border-4 border-dashed border-gray-600 flex items-center justify-center mb-6 relative overflow-hidden">
            {scanning ? (
              <motion.div
                className="absolute inset-0 bg-blue-500/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ) : scanResult ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex flex-col items-center gap-4 ${
                  scanResult.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle className="size-24" />
                ) : (
                  <XCircle className="size-24" />
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{scanResult.message}</div>
                  {scanResult.ticketInfo && (
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>{scanResult.ticketInfo.event_name}</div>
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

          <div className="space-y-4">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Enter ticket code or scan QR..."
              className="w-full px-4 py-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white text-center text-lg font-mono"
              disabled={scanning}
            />

            <button
              onClick={handleScan}
              disabled={scanning || !qrCode.trim()}
              className="w-full px-6 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {scanning ? 'Scanning...' : 'Scan Ticket'}
            </button>
          </div>
        </div>

        {/* Live Stats */}
        {stats && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="size-5 text-green-400" />
                <h2 className="text-xl font-bold">Live Stats</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
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

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Capacity Progress</span>
                  <span className="text-sm font-semibold">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{stats.normal_sold}</div>
                  <div className="text-xs text-gray-400">Normal</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{stats.vip_sold}</div>
                  <div className="text-xs text-gray-400">VIP</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{stats.vvip_sold}</div>
                  <div className="text-xs text-gray-400">VVIP</div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
