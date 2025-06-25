import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';

interface GamePinDisplayProps {
  pin: string;
  joinUrl?: string;
}

export default function GamePinDisplay({ 
  pin, 
  joinUrl
}: GamePinDisplayProps) {
  const [showQRModal, setShowQRModal] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowQRModal(false);
      }
    };

    if (showQRModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showQRModal]);

  // Extract domain from URL without protocol
  const getDomainFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.port ? `:${urlObj.port}` : '');
    } catch {
      return url.replace(/^https?:\/\//, '');
    }
  };

  const websiteUrl = joinUrl ? getDomainFromUrl(joinUrl) : 'localhost:3000';

  return (
    <div className="flex gap-6 mb-6 justify-center">
      {/* Website URL Box */}
      <div className="bg-white/20 rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px]">
        <div className="text-white/80 text-sm text-center">Website URL</div>
        <div className="text-3xl font-bold text-white text-center break-all">{websiteUrl}</div>
      </div>
      
      {/* PIN Box */}
      <div className="bg-white/20 rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px]">
        <div className="text-white/80 text-sm">Game PIN</div>
        <div className="text-5xl font-bold text-white">{pin}</div>
      </div>
      
      {/* QR Code Box */}
      {joinUrl && (
        <div 
          className="bg-white rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowQRModal(true)}
          title="Click to enlarge QR code"
        >
          <QRCode
            size={80}
            value={joinUrl}
            viewBox={`0 0 256 256`}
          />
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && joinUrl && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={() => setShowQRModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="bg-white rounded-lg p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCode
              size={320}
              value={joinUrl}
              viewBox={`0 0 320 320`}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 