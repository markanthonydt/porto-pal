import FlashcardLibraryPanel from '../components/flashcards/FlashcardLibraryPanel';
import FlashcardStudyPanel from '../components/flashcards/FlashcardStudyPanel';
import { useFlashcardSession } from '../hooks/useFlashcardSession';

export default function FlashcardsPage() {
  const session = useFlashcardSession();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <FlashcardLibraryPanel {...session} />
      <FlashcardStudyPanel {...session} />
    </div>
  );
}
