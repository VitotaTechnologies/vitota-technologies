'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  useEffect,
  useState,
} from 'react';

import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

type Milestone = {
  id: string;
  title: string;
  status: string;
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  progress: number;
  totalCost: number;
  currency: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
  milestones?: Milestone[];
};

function Celebration({
  active,
}: {
  active: boolean;
}) {
  if (!active) return null;

  const pieces = Array.from(
    { length: 90 },
    (_, index) => index
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => {
        const left =
          (piece * 37) % 100;

        const delay =
          (piece % 18) * 0.05;

        const duration =
          2.8 +
          (piece % 8) * 0.18;

        const rotation =
          (piece * 47) % 360;

        return (
          <span
            key={piece}
            className="absolute top-[-30px] h-3 w-2 animate-[projectConfetti_linear_forwards]"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `rotate(${rotation}deg)`,
              background:
                piece % 4 === 0
                  ? '#22c55e'
                  : piece % 4 === 1
                    ? '#3b82f6'
                    : piece % 4 === 2
                      ? '#f59e0b'
                      : '#ec4899',
            }}
          />
        );
      })}

      <div className="absolute inset-x-0 top-24 flex justify-center px-4">
        <div className="rounded-2xl border border-success/40 bg-background-secondary/95 px-8 py-6 text-center shadow-2xl backdrop-blur">
          <div className="text-5xl">
            🎉
          </div>

          <h2 className="mt-3 text-2xl font-bold text-success">
            Project Completed!
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            This project has been successfully
            marked as completed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router = useRouter();

  const queryClient =
    useQueryClient();

  const projectId =
    params.id;

  const [progress, setProgress] =
    useState('');

  const [updateLoading, setUpdateLoading] =
    useState(false);

  const [completeModal, setCompleteModal] =
    useState(false);

  const [confirmModal, setConfirmModal] =
    useState(false);

  const [completionPassword, setCompletionPassword] =
    useState('');

  const [completeLoading, setCompleteLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [celebration, setCelebration] =
    useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'admin-project',
      projectId,
    ],
    queryFn: async () => {
      const res =
        await fetch(
          `/api/admin/projects/${projectId}`,
          {
            cache: 'no-store',
          }
        );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json.success
      ) {
        throw new Error(
          json.error?.message ||
            'Failed to load project.'
        );
      }

      return json.data;
    },
    enabled:
      Boolean(projectId),
  });

  const project: Project | null =
    data?.project ??
    data ??
    null;

  useEffect(() => {
    if (project) {
      setProgress(
        String(
          project.progress ?? 0
        )
      );
    }
  }, [project]);

  useEffect(() => {
    if (!celebration) return;

    const timer =
      window.setTimeout(
        () => {
          setCelebration(false);
        },
        6000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [celebration]);

  async function updateProgress() {
    if (!project) return;

    const numericProgress =
      Number(progress);

    if (
      !Number.isInteger(
        numericProgress
      ) ||
      numericProgress < 0 ||
      numericProgress > 100
    ) {
      setError(
        'Progress must be a whole number between 0 and 100.'
      );
      return;
    }

    if (
      project.status ===
      'COMPLETED'
    ) {
      setError(
        'Completed projects cannot be changed.'
      );
      return;
    }

    setUpdateLoading(true);
    setError('');

    try {
      const res =
        await fetch(
          `/api/admin/projects/${project.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              progress:
                numericProgress,
            }),
          }
        );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json.success
      ) {
        throw new Error(
          json.error?.message ||
            'Failed to update progress.'
        );
      }

      await queryClient.invalidateQueries(
        {
          queryKey: [
            'admin-project',
            project.id,
          ],
        }
      );

      await queryClient.invalidateQueries(
        {
          queryKey: [
            'admin-projects',
          ],
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update progress.'
      );
    } finally {
      setUpdateLoading(false);
    }
  }

  function openCompletionFlow() {
    if (!project) return;

    if (
      project.status ===
      'COMPLETED'
    ) {
      return;
    }

    setError('');
    setCompletionPassword('');
    setCompleteModal(true);
  }

  function continueToConfirmation() {
    if (
      !completionPassword.trim()
    ) {
      setError(
        'Please enter the project completion password.'
      );
      return;
    }

    setError('');
    setCompleteModal(false);
    setConfirmModal(true);
  }

  async function confirmCompletion() {
    if (!project) return;

    setCompleteLoading(true);
    setError('');

    try {
      const res =
        await fetch(
          `/api/admin/projects/${project.id}/complete`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              password:
                completionPassword,
            }),
          }
        );

      const json =
        await res.json();

      if (
        !res.ok ||
        !json.success
      ) {
        throw new Error(
          json.error?.message ||
            'Unable to complete project.'
        );
      }

      setConfirmModal(false);
      setCompletionPassword('');

      await queryClient.invalidateQueries(
        {
          queryKey: [
            'admin-project',
            project.id,
          ],
        }
      );

      await queryClient.invalidateQueries(
        {
          queryKey: [
            'admin-projects',
          ],
        }
      );

      setCelebration(true);
    } catch (err) {
      setConfirmModal(false);
      setCompleteModal(true);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete project.'
      );
    } finally {
      setCompleteLoading(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (
    isError ||
    !project
  ) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        Unable to load this project.
      </div>
    );
  }

  const isCompleted =
    project.status ===
    'COMPLETED';

  const paid =
    0;

  const pending =
    Math.max(
      0,
      Number(
        project.totalCost || 0
      ) - paid
    );

  return (
    <>
      <Celebration
        active={celebration}
      />

      <div className="space-y-6">
        {/* PROJECT HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  '/admin/projects'
                )
              }
              className="mb-3 text-sm text-text-secondary transition hover:text-primary"
            >
              ← Back to Projects
            </button>

            <h1 className="text-3xl font-bold">
              {project.name}
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Client:{' '}
              <span className="text-text-primary">
                {project.client
                  ?.name ||
                  'Unknown'}
              </span>
            </p>
          </div>

          {isCompleted ? (
            <span className="w-fit rounded-full border border-success/40 bg-success/10 px-4 py-2 text-sm font-semibold text-success">
              ✓ PROJECT COMPLETED
            </span>
          ) : (
            <StatusBadge
              status={
                project.status
              }
            />
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background-secondary p-5">
            <p className="text-sm text-text-secondary">
              Progress
            </p>

            <p
              className={`mt-1 text-3xl font-bold ${
                isCompleted
                  ? 'text-success'
                  : 'text-text-primary'
              }`}
            >
              {project.progress}%
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background-secondary p-5">
            <p className="text-sm text-text-secondary">
              Paid
            </p>

            <p className="mt-1 text-2xl font-bold text-success">
              ₹
              {paid.toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                }
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background-secondary p-5">
            <p className="text-sm text-text-secondary">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-warning">
              ₹
              {pending.toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                }
              )}
            </p>
          </div>
        </div>

        {/* PROGRESS CONTROL */}
        <section className="rounded-2xl border border-border bg-background-secondary p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Update Progress
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Set project progress between
              0 and 100.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-xs">
              <label className="mb-2 block text-sm font-medium">
                Progress (0–100)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                disabled={
                  isCompleted ||
                  updateLoading
                }
                onChange={(e) =>
                  setProgress(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={
                updateProgress
              }
              disabled={
                isCompleted ||
                updateLoading
              }
              className="rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateLoading
                ? 'Updating...'
                : 'Update'}
            </button>

            {/* COMPLETE PROJECT */}
            <button
              type="button"
              onClick={
                openCompletionFlow
              }
              disabled={
                isCompleted ||
                updateLoading ||
                completeLoading
              }
              className="rounded-lg border border-success/50 bg-success/10 px-5 py-3 font-semibold text-success transition hover:border-success hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCompleted
                ? '✓ Project Completed'
                : '✓ Complete Project'}
            </button>
          </div>

          {isCompleted && (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
              This project is permanently
              marked as completed. Progress
              and completion controls are
              locked.
            </div>
          )}
        </section>

        {/* MILESTONES */}
        <section className="rounded-2xl border border-border bg-background-secondary p-6">
          <h2 className="mb-5 text-xl font-bold">
            Milestones
          </h2>

          {!project.milestones ||
          project.milestones.length ===
            0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-text-secondary">
              No milestones added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {project.milestones.map(
                (milestone) => {
                  const milestoneCompleted =
                    milestone.status ===
                    'COMPLETED';

                  return (
                    <div
                      key={
                        milestone.id
                      }
                      className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold">
                        {
                          milestone.title
                        }
                      </span>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            milestoneCompleted
                              ? 'border-success/30 bg-success/10 text-success'
                              : 'border-border bg-surface text-text-secondary'
                          }`}
                        >
                          {milestoneCompleted
                            ? '✓ COMPLETED'
                            : milestone.status}
                        </span>

                        <select
                          disabled={
                            isCompleted
                          }
                          defaultValue={
                            milestone.status
                          }
                          className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="PENDING">
                            PENDING
                          </option>
                          <option value="IN_PROGRESS">
                            IN PROGRESS
                          </option>
                          <option value="COMPLETED">
                            COMPLETED
                          </option>
                        </select>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* DESCRIPTION */}
        {project.description && (
          <section className="rounded-2xl border border-border bg-background-secondary p-6">
            <h2 className="mb-3 text-xl font-bold">
              Description
            </h2>

            <p className="whitespace-pre-wrap text-sm leading-7 text-text-secondary">
              {
                project.description
              }
            </p>
          </section>
        )}

        {/* DATE */}
        <div className="text-xs text-text-muted">
          Created:{' '}
          {formatDate(
            project.createdAt
          )}
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {completeModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-success/30 bg-background-secondary p-6 shadow-2xl">
            <div className="mb-5">
              <div className="mb-3 text-3xl">
                🔐
              </div>

              <h2 className="text-xl font-bold">
                Complete Project
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Enter the secure project completion
                password to continue.
              </p>
            </div>

            <input
              type="password"
              value={
                completionPassword
              }
              onChange={(e) =>
                setCompletionPassword(
                  e.target.value
                )
              }
              autoFocus
              placeholder="Enter completion password"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 outline-none focus:border-success"
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter'
                ) {
                  continueToConfirmation();
                }
              }}
            />

            {error && (
              <p className="mt-3 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCompleteModal(
                    false
                  );
                  setCompletionPassword(
                    ''
                  );
                  setError('');
                }}
                className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  continueToConfirmation
                }
                className="flex-1 rounded-lg bg-success px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL CONFIRMATION */}
      {confirmModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-success/30 bg-background-secondary p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-5xl">
                🎉
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                Confirm Project Completion
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Are you sure you want to mark
                <strong className="text-text-primary">
                  {' '}
                  {project.name}{' '}
                </strong>
                as completed?
              </p>

              <p className="mt-2 text-xs text-text-muted">
                This action will set progress to
                100% and lock the project
                completion control.
              </p>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={
                  completeLoading
                }
                onClick={() => {
                  setConfirmModal(
                    false
                  );
                  setCompleteModal(
                    true
                  );
                }}
                className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={
                  completeLoading
                }
                onClick={
                  confirmCompletion
                }
                className="flex-1 rounded-lg bg-success px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {completeLoading
                  ? 'Completing...'
                  : 'Yes, Complete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}