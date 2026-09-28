'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const qc = useQueryClient();

  const [activeConv, setActiveConv] =
    useState<string | null>(null);

  const [content, setContent] = useState('');

  /* ---------------------------------------------------------------------- */
  /* CONVERSATIONS                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-conversations'],

    queryFn: async () => {
      const res = await fetch(
        '/api/admin/conversations',
        {
          cache: 'no-store',
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Failed to load conversations.'
        );
      }

      return json.data;
    },

    refetchInterval: 15000,
  });

  /* ---------------------------------------------------------------------- */
  /* ACTIVE THREAD                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: thread,
    isLoading: threadLoading,
    isError: threadError,
    error: threadErrorObject,
  } = useQuery({
    queryKey: [
      'admin-thread',
      activeConv,
    ],

    queryFn: async () => {
      if (!activeConv) return null;

      const res = await fetch(
        `/api/admin/conversations/${activeConv}`,
        {
          cache: 'no-store',
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Failed to load conversation.'
        );
      }

      return json.data;
    },

    enabled: !!activeConv,

    refetchInterval: 10000,
  });

  /* ---------------------------------------------------------------------- */
  /* SEND MESSAGE                                                            */
  /* ---------------------------------------------------------------------- */

  const send = useMutation({
    mutationFn: async (
      messageContent: string
    ) => {
      if (!activeConv) {
        throw new Error(
          'Conversation not selected.'
        );
      }

      const res = await fetch(
        `/api/admin/conversations/${activeConv}/messages`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            content: messageContent,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Failed to send message.'
        );
      }

      return json;
    },

    onSuccess: () => {
      setContent('');

      qc.invalidateQueries({
        queryKey: [
          'admin-thread',
          activeConv,
        ],
      });

      qc.invalidateQueries({
        queryKey: [
          'admin-conversations',
        ],
      });
    },
  });

  /* ---------------------------------------------------------------------- */
  /* LOADING                                                                 */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return <LoadingState />;
  }

  /* ---------------------------------------------------------------------- */
  /* CONVERSATION LIST ERROR                                                 */
  /* ---------------------------------------------------------------------- */

  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary">
            Unable to load conversations
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            {error instanceof Error
              ? error.message
              : 'Something went wrong.'}
          </p>

          <button
            type="button"
            onClick={() =>
              qc.invalidateQueries({
                queryKey: [
                  'admin-conversations',
                ],
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

  /* ---------------------------------------------------------------------- */
  /* UI                                                                       */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <h1 className="shrink-0 text-2xl font-bold">
        Messages
      </h1>

      <div
        className="
          glass
          grid
          h-[70vh]
          min-h-0
          grid-cols-1
          overflow-hidden
          rounded-xl
          lg:grid-cols-[320px_1fr]
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* CONVERSATION LIST                                                */}
        {/* ---------------------------------------------------------------- */}

        <aside
          className={cn(
            'min-h-0 overflow-y-auto border-r border-border',

            activeConv &&
              'hidden lg:block'
          )}
        >
          {conversations?.items?.length ===
            0 && (
            <EmptyState
              title="No conversations"
              className="m-4"
            />
          )}

          {conversations?.items?.map(
            (conversation: any) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  setActiveConv(
                    conversation.id
                  )
                }
                className={cn(
                  'flex w-full flex-col items-start gap-1 border-b border-border px-4 py-3 text-left text-sm transition hover:bg-surface/50',

                  activeConv ===
                    conversation.id &&
                    'bg-primary/10'
                )}
              >
                <span className="font-medium">
                  {
                    conversation
                      .client?.user?.name
                  }
                </span>

                <span className="line-clamp-1 text-xs text-text-muted">
                  {conversation.lastMessagePreview ??
                    'No messages yet'}
                </span>
              </button>
            )
          )}
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* THREAD                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section
          className={cn(
            'flex min-h-0 min-w-0 flex-col overflow-hidden',

            !activeConv &&
              'hidden lg:flex'
          )}
        >
          {!activeConv ? (
            <div className="grid min-h-0 flex-1 place-items-center text-sm text-text-muted">
              Select a conversation
            </div>
          ) : threadLoading ? (
            <LoadingState />
          ) : threadError ? (
            <div className="flex min-h-0 flex-1 items-center justify-center p-6">
              <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <h2 className="text-lg font-semibold text-text-primary">
                  Unable to load conversation
                </h2>

                <p className="mt-2 text-sm text-text-secondary">
                  {threadErrorObject instanceof
                  Error
                    ? threadErrorObject.message
                    : 'Something went wrong.'}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    qc.invalidateQueries({
                      queryKey: [
                        'admin-thread',
                        activeConv,
                      ],
                    })
                  }
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ---------------------------------------------------------- */}
              {/* HEADER                                                       */}
              {/* ---------------------------------------------------------- */}

              <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {
                      thread?.client
                        ?.user?.name
                    }
                  </div>

                  <div className="mt-0.5 text-xs text-text-muted">
                    Client
                  </div>
                </div>

                {/* MOBILE BACK */}

                <Button
                  size="sm"
                  variant="ghost"
                  className="lg:hidden"
                  onClick={() =>
                    setActiveConv(null)
                  }
                >
                  Back
                </Button>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* MESSAGES                                                     */}
              {/* ---------------------------------------------------------- */}

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {thread?.messages?.length ===
                  0 && (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                        V
                      </div>

                      <p className="mt-4 text-sm text-text-muted">
                        No messages yet
                      </p>
                    </div>
                  </div>
                )}

                {thread?.messages?.map(
                  (message: any) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',

                        message.senderRole ===
                          'CLIENT'
                          ? 'justify-start'
                          : 'justify-end'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',

                          message.senderRole ===
                            'CLIENT'
                            ? 'bg-surface text-text-primary'
                            : 'bg-primary text-primary-foreground'
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>

                        <div className="mt-1 text-[10px] opacity-70">
                          {formatDateTime(
                            message.createdAt
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* ---------------------------------------------------------- */}
              {/* MESSAGE INPUT                                               */}
              {/* ---------------------------------------------------------- */}

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  const trimmed =
                    content.trim();

                  if (
                    !trimmed ||
                    send.isPending
                  ) {
                    return;
                  }

                  send.mutate(trimmed);
                }}
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  border-t
                  border-border
                  bg-background-secondary
                  p-3
                "
              >
                <input
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target.value
                    )
                  }
                  placeholder="Type a message..."
                  disabled={
                    send.isPending
                  }
                  maxLength={4000}
                  className="
                    min-w-0
                    flex-1
                    rounded-lg
                    border
                    border-border
                    bg-surface
                    px-3
                    py-2.5
                    text-sm
                    text-text-primary
                    outline-none
                    transition
                    placeholder:text-text-muted
                    focus:border-primary
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

                <Button
                  type="submit"
                  loading={
                    send.isPending
                  }
                  disabled={
                    !content.trim() ||
                    send.isPending
                  }
                  className="shrink-0"
                >
                  Send
                </Button>
              </form>

              {/* SEND ERROR */}

              {send.isError && (
                <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-center text-xs text-red-400">
                  {send.error instanceof
                  Error
                    ? send.error.message
                    : 'Failed to send message.'}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}