import { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import Button from './Button';

interface GamePinDisplayProps {
  pin: string;
  joinUrl?: string;
  showQRToggle?: boolean;
  onCopyPin?: () => void;
}

export default function GamePinDisplay({ 
  pin, 
  joinUrl, 
  showQRToggle = false,
  onCopyPin
}: GamePinDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopyPin = async () => {
    try {
      // Copy the full join URL if available, otherwise fall back to PIN
      const textToCopy = joinUrl || pin;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyPin?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };



  return (
    <div className="flex items-center justify-center gap-6 mb-6">
      {/* PIN Display */}
      <div className="bg-white/20 rounded-lg p-6">
        <div className="text-white/80 text-sm mb-1">Game PIN</div>
        <div className="text-3xl font-bold text-white">{pin}</div>
      </div>
      
      {/* QR Code Display */}
      {showQR && joinUrl && (
        <div className="bg-white rounded-lg p-4">
          <QRCode
            size={120}
            value={joinUrl}
            viewBox={`0 0 256 256`}
          />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleCopyPin}
          variant="secondary"
          size="icon"
          title={joinUrl ? "Copy Join Link" : "Copy PIN"}
          icon={copied ? Check : Copy}
        />
        {showQRToggle && joinUrl && (
          <Button
            onClick={() => setShowQR(!showQR)}
            variant={showQR ? 'primary' : 'secondary'}
            size="icon"
            title="Toggle QR Code"
            icon={QrCode}
          />
        )}
      </div>
      

    </div>
  );
} 