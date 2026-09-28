'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatDateTime, cn } from '@/lib/utils';

type Message = {
  id: string;
  senderId: string;
  senderRole: 'CLIENT' | 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';
  content: string;
  createdAt: string;
};

type ClientThread = {
  conversationId?: string;
  messages: Message[];
};

export default function ClientMessagesPage() {
  const queryClient = useQueryClient();

  const [content, setContent] = useState('');

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<ClientThread>({
    queryKey: ['client-thread'],

    queryFn: async () => {
      const response = await fetch(
        '/api/client/messages',
        {
          cache: 'no-store',
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Failed to load messages.'
        );
      }

      return json.data;
    },

    refetchInterval: 15000,
  });

  const send = useMutation({
    mutationFn: async (
      messageContent: string
    ) => {
      const response = await fetch(
        '/api/client/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Failed to send message.'
        );
      }

      return json;
    },

    onSuccess: () => {
      setContent('');

      queryClient.invalidateQueries({
        queryKey: ['client-thread'],
      });
    },
  });

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }, [data?.messages?.length]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmed = content.trim();

    if (!trimmed || send.isPending) {
      return;
    }

    send.mutate(trimmed);
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary">
            Unable to load messages
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            {error instanceof Error
              ? error.message
              : 'Something went wrong.'}
          </p>

          <button
            type="button"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ['client-thread'],
              })
            }
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const messages = data?.messages ?? [];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Messages
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Chat with the Vitota Technologies team
        </p>
      </div>

      <div className="glass flex h-[70vh] min-h-0 flex-col overflow-hidden rounded-xl">
        {/* Chat Header */}
        <div className="flex shrink-0 items-center border-b border-border px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              V
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-semibold text-text-primary">
                Vitota Technologies
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Contact the Vitota Technologies team
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  V
                </div>

                <h3 className="mt-4 font-medium text-text-primary">
                  Start a conversation
                </h3>

                <p className="mt-1 text-sm text-text-muted">
                  Send a message to the Vitota Technologies
                  team.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isClient =
                message.senderRole === 'CLIENT';

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    isClient
                      ? 'justify-end'
                      : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                      isClient
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-surface text-text-primary'
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>

                    <div
                      className={cn(
                        'mt-1 text-[10px]',
                        isClient
                          ? 'text-primary-foreground/60'
                          : 'text-text-muted'
                      )}
                    >
                      {formatDateTime(
                        message.createdAt
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 border-t border-border bg-background-secondary p-3"
        >
          <input
            type="text"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Type a message..."
            disabled={send.isPending}
            maxLength={4000}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />

          <Button
            type="submit"
            loading={send.isPending}
            disabled={
              !content.trim() || send.isPending
            }
            className="shrink-0"
          >
            Send
          </Button>
        </form>

        {/* Send Error */}
        {send.isError && (
          <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-center text-xs text-red-400">
            {send.error instanceof Error
              ? send.error.message
              : 'Failed to send message.'}
          </div>
        )}
      </div>
    </div>
  );
}