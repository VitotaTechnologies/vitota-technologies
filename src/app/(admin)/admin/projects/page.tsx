'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

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
};

type FilterType = 'ALL' | 'COMPLETED' | 'NOT_COMPLETED';

export default function ProjectsPage() {
  const [filter, setFilter] =
    useState<FilterType>('ALL');

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const res = await fetch(
        '/api/admin/projects',
        {
          cache: 'no-store',
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message ||
            'Failed to load projects.'
        );
      }

      return json.data;
    },
  });

  const projects: Project[] =
    data?.items ??
    data?.projects ??
    data ??
    [];

  const filteredProjects =
    useMemo(() => {
      if (filter === 'COMPLETED') {
        return projects.filter(
          (project) =>
            project.status === 'COMPLETED'
        );
      }

      if (filter === 'NOT_COMPLETED') {
        return projects.filter(
          (project) =>
            project.status !== 'COMPLETED'
        );
      }

      return projects;
    }, [projects, filter]);

  const completedCount =
    projects.filter(
      (project) =>
        project.status === 'COMPLETED'
    ).length;

  const notCompletedCount =
    projects.length - completedCount;

  function money(
    amount: number,
    currency: string
  ) {
    try {
      return new Intl.NumberFormat(
        'en-IN',
        {
          style: 'currency',
          currency:
            currency || 'INR',
          maximumFractionDigits: 2,
        }
      ).format(amount || 0);
    } catch {
      return `${currency || 'INR'} ${amount || 0}`;
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Projects
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage project progress, milestones,
          payments and completion.
        </p>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            setFilter('ALL')
          }
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            filter === 'ALL'
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          All
          <span className="ml-2 opacity-70">
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilter('COMPLETED')
          }
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            filter === 'COMPLETED'
              ? 'border-success bg-success/10 text-success'
              : 'border-border bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          ✓ Completed
          <span className="ml-2 opacity-70">
            {completedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setFilter('NOT_COMPLETED')
          }
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            filter === 'NOT_COMPLETED'
              ? 'border-warning bg-warning/10 text-warning'
              : 'border-border bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          ◷ Not Completed
          <span className="ml-2 opacity-70">
            {notCompletedCount}
          </span>
        </button>
      </div>

      {/* LOADING */}
      {isLoading && (
        <LoadingState />
      )}

      {/* ERROR */}
      {isError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          Failed to load projects.
          Please refresh the page.
        </div>
      )}

      {/* EMPTY */}
      {!isLoading &&
        !isError &&
        filteredProjects.length === 0 && (
          <EmptyState
            title={
              filter === 'COMPLETED'
                ? 'No completed projects'
                : filter ===
                    'NOT_COMPLETED'
                  ? 'No pending projects'
                  : 'No projects found'
            }
          />
        )}

      {/* PROJECTS */}
      {!isLoading &&
        !isError &&
        filteredProjects.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredProjects.map(
              (project) => {
                const isCompleted =
                  project.status ===
                  'COMPLETED';

                const progress = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      project.progress || 0
                    )
                  )
                );

                return (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}`}
                    className="group block"
                  >
                    <article
                      className={`rounded-2xl border bg-background-secondary p-6 transition-all duration-200 ${
                        isCompleted
                          ? 'border-success/30 hover:border-success/60'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-text-primary group-hover:text-primary">
                            {project.name}
                          </h2>

                          <p className="mt-1 truncate text-sm text-text-secondary">
                            {project.client
                              ?.name ||
                              'No client'}
                          </p>
                        </div>

                        {isCompleted ? (
                          <span className="shrink-0 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                            ✓ COMPLETED
                          </span>
                        ) : (
                          <StatusBadge
                            status={
                              project.status
                            }
                          />
                        )}
                      </div>

                      {/* PROGRESS */}
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            Progress
                          </span>

                          <span
                            className={`font-semibold ${
                              isCompleted
                                ? 'text-success'
                                : 'text-text-primary'
                            }`}
                          >
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-surface">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted
                                ? 'bg-success'
                                : 'bg-primary'
                            }`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* BOTTOM */}
                      <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                        <span className="text-text-secondary">
                          {money(
                            project.totalCost,
                            project.currency
                          )}
                        </span>

                        <span className="text-text-muted">
                          {formatDate(
                            project.createdAt
                          )}
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              }
            )}
          </div>
        )}
    </div>
  );
}