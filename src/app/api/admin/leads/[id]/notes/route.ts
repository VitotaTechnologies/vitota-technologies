import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { leadNoteSchema } from '@/server/validations/lead';
import { ok, fail } from '@/lib/api-response';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { content } = leadNoteSchema.parse(await req.json());
    const note = await prisma.leadNote.create({
      data: { leadId: params.id, authorId: admin.id, content },
    });
    return ok(note);
  } catch (err) {
    return fail(err);
  }
}