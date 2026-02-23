import { Skeleton } from '@/components/ui/skeleton';

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations sidebar */}
      <div className="hidden md:flex w-80 flex-col gap-3 border-r border-zinc-200 pr-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        {/* Messages area */}
        <div className="flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <Skeleton
                className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-64' : 'w-48'}`}
              />
            </div>
          ))}
        </div>
        {/* Input area */}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
