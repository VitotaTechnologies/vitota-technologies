'use client';

import {
  Phone,
  Video,
  PhoneMissed,
  PhoneOff,
} from 'lucide-react';

import { formatDateTime } from '@/lib/utils';

type CallSession = {
  id: string;
  type: 'AUDIO' | 'VIDEO';
  status:
    | 'RINGING'
    | 'ANSWERED'
    | 'MISSED'
    | 'DECLINED'
    | 'ENDED';
  startedAt: string;
  answeredAt?: string | null;
  endedAt?: string | null;
  duration?: number | null;
  createdAt: string;
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds < 1) {
    return '00:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`;
}

function getStatusText(status: CallSession['status']) {
  switch (status) {
    case 'ANSWERED':
      return 'Answered';

    case 'MISSED':
      return 'Missed';

    case 'DECLINED':
      return 'Declined';

    case 'ENDED':
      return 'Ended';

    case 'RINGING':
      return 'Calling...';

    default:
      return status;
  }
}

export default function CallMessageCard({
  call,
  mine = false,
}: {
  call: CallSession;
  mine?: boolean;
}) {
  const isVideo = call.type === 'VIDEO';

  const Icon =
    call.status === 'MISSED'
      ? PhoneMissed
      : call.status === 'DECLINED'
        ? PhoneOff
        : isVideo
          ? Video
          : Phone;

  return (
    <div
      className={`flex ${
        mine ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex min-w-[220px] max-w-[290px] items-center gap-3 rounded-2xl px-4 py-3 ${
          mine
            ? 'bg-primary text-primary-foreground'
            : 'bg-surface text-text-primary'
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            mine
              ? 'bg-white/15'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">
            {isVideo ? 'Video Call' : 'Audio Call'}
          </div>

          <div
            className={`mt-0.5 text-xs ${
              mine
                ? 'text-white/70'
                : 'text-text-muted'
            }`}
          >
            {getStatusText(call.status)}
          </div>

          {(call.status === 'ANSWERED' ||
            call.status === 'ENDED') && (
            <div
              className={`mt-1 font-mono text-xs ${
                mine
                  ? 'text-white/70'
                  : 'text-text-muted'
              }`}
            >
              {formatDuration(call.duration)}
            </div>
          )}

          <div
            className={`mt-1 text-[10px] ${
              mine
                ? 'text-white/50'
                : 'text-text-muted'
            }`}
          >
            {formatDateTime(call.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}