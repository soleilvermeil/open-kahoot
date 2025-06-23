import QRCode from 'react-qr-code';

interface GamePinDisplayProps {
  pin: string;
  joinUrl?: string;
}

export default function GamePinDisplay({ 
  pin, 
  joinUrl
}: GamePinDisplayProps) {

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
        <div className="text-white/80 text-sm mb-2 text-center">Website URL</div>
        <div className="text-lg font-bold text-white text-center break-all">{websiteUrl}</div>
      </div>
      
      {/* PIN Box */}
      <div className="bg-white/20 rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px]">
        <div className="text-white/80 text-sm mb-2">Game PIN</div>
        <div className="text-3xl font-bold text-white">{pin}</div>
      </div>
      
      {/* QR Code Box */}
      {joinUrl && (
        <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
          <QRCode
            size={80}
            value={joinUrl}
            viewBox={`0 0 256 256`}
          />
        </div>
      )}
    </div>
  );
} 