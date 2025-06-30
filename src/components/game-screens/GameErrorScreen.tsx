import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import ErrorScreen from '@/components/ErrorScreen';

interface GameErrorScreenProps {
  error: string;
}

export default function GameErrorScreen({ error }: GameErrorScreenProps) {
  const router = useRouter();

  return (
    <PageLayout gradient="error" showLogo={false}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorScreen
          title="Game Not Found"
          message={error}
          actionText="Go Home Now"
          onAction={() => router.push('/')}
          autoRedirect={{
            url: '/',
            delay: 3000,
            message: 'Redirecting to home page...'
          }}
        />
      </div>
    </PageLayout>
  );
} 