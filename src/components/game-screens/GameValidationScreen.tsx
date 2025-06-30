import PageLayout from '@/components/PageLayout';
import LoadingScreen from '@/components/LoadingScreen';

export default function GameValidationScreen() {
  return (
    <PageLayout gradient="loading" showLogo={false}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingScreen 
          title="Validating game..." 
          description="Please wait while we check the game status"
        />
      </div>
    </PageLayout>
  );
} 