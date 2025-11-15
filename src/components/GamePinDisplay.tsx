'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  // Extract domain from URL without protocol and www
  const getDomainFromUrl = (url: string) => {
    try {
      // If no protocol is provided, assume https
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      
      const urlObj = new URL(urlWithProtocol);
      const hostname = urlObj.hostname.replace(/^www\./, ''); // Remove www. from display
      return hostname + (urlObj.port ? `:${urlObj.port}` : '');
    } catch {
      // Fallback: extract just the domain part, never include paths
      const withoutProtocol = url.replace(/^https?:\/\//, '');
      const domainOnly = withoutProtocol.split('/')[0];
      return domainOnly.replace(/^www\./, ''); // Remove www. from display
    }
  };

  const websiteUrl = joinUrl ? getDomainFromUrl(joinUrl) : 'localhost:3000';

  return (
    <div className="flex gap-6 mb-6 justify-center">
      {/* Website URL Box */}
      <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px] border border-gray-300">
        <div className="text-gray-600 text-sm text-center">{t('host.lobby.websiteUrl')}</div>
        <div className="text-3xl font-bold text-black text-center break-all">{websiteUrl}</div>
      </div>
      
      {/* PIN Box */}
      <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px] border border-gray-300">
        <div className="text-gray-600 text-sm">{t('host.lobby.gamePin')}</div>
        <div className="text-5xl font-bold text-black">{pin}</div>
      </div>
      
      {/* QR Code Box */}
      {joinUrl && (
        <div 
          className="bg-white rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors border border-gray-300"
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
            className="bg-white rounded-lg p-8 border border-gray-300"
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