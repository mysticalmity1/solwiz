import { BattleScreen } from '@/components/screens/BattleScreen';

export default function BattleRoomPage({ params }: { params: { roomId: string } }) {
  // roomId is handled globally in context via sockets, but we route here to display the UI
  return <BattleScreen />;
}
