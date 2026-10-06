import { describe, expect, test } from 'vitest';
import { broadcastStatus, peopleOf } from './broadcastParts';
import { broadcast } from './testFixtures';

const ADMIN = 'admin-1';
const WORKER = 'worker-1';
const pending = { participant: { id: WORKER, name: 'Carlos Vidana' }, respondedAt: null, openedAt: null };
const answered = { participant: { id: WORKER, name: 'Carlos Vidana' }, respondedAt: new Date().toISOString(), openedAt: null };
const msg = (authorId: string, body = 'hi') => ({ id: body, authorId, authorName: null, body, createdAt: new Date().toISOString() });

describe('broadcastStatus, sent side', () => {
  test('needs reply when the latest message is from a recipient', () => {
    const b = broadcast({ recipients: [answered], messages: [msg(WORKER, 'Question?')] });
    expect(broadcastStatus(b, 'sent', ADMIN)).toBe('needsReply');
  });

  test('waiting while a recipient has not answered', () => {
    const b = broadcast({ recipients: [pending], messages: [] });
    expect(broadcastStatus(b, 'sent', ADMIN)).toBe('waiting');
  });

  test('answered once everyone has answered and the sender spoke last', () => {
    const b = broadcast({ recipients: [answered], messages: [msg(WORKER, 'Done'), msg(ADMIN, 'Thanks')] });
    expect(broadcastStatus(b, 'sent', ADMIN)).toBe('answered');
  });

  test('closed wins over everything else', () => {
    const b = broadcast({ recipients: [pending], messages: [msg(WORKER)], closedAt: new Date().toISOString() });
    expect(broadcastStatus(b, 'sent', ADMIN)).toBe('closed');
  });
});

describe('broadcastStatus, received side', () => {
  test('needs reply before the viewer has answered', () => {
    const b = broadcast({ recipients: [{ participant: { id: WORKER, name: 'Me' }, respondedAt: null, openedAt: null }], messages: [] });
    expect(broadcastStatus(b, 'received', WORKER)).toBe('needsReply');
  });

  test('answered when the viewer spoke last', () => {
    const b = broadcast({ recipients: [{ participant: { id: WORKER, name: 'Me' }, respondedAt: new Date().toISOString(), openedAt: null }], messages: [msg(WORKER, 'Yes')] });
    expect(broadcastStatus(b, 'received', WORKER)).toBe('answered');
  });

  test('needs reply again when the sender writes after the viewer', () => {
    const b = broadcast({ recipients: [{ participant: { id: WORKER, name: 'Me' }, respondedAt: new Date().toISOString(), openedAt: null }], messages: [msg(WORKER, 'Yes'), msg(ADMIN, 'Really?')] });
    expect(broadcastStatus(b, 'received', WORKER)).toBe('needsReply');
  });

  test('answered with no messages when the viewer already confirmed', () => {
    const b = broadcast({ recipients: [{ participant: { id: WORKER, name: 'Me' }, respondedAt: new Date().toISOString(), openedAt: null }], messages: [] });
    expect(broadcastStatus(b, 'received', WORKER)).toBe('answered');
  });
});

describe('peopleOf', () => {
  test('sent lists everyone it went to', () => {
    const b = broadcast({ recipients: [pending, { participant: { id: 'w2', name: 'Ana Ruiz' }, respondedAt: null, openedAt: null }] });
    expect(peopleOf(b, 'sent').map((p) => p.name)).toEqual(['Carlos Vidana', 'Ana Ruiz']);
  });

  test('received lists the sender', () => {
    const b = broadcast({ createdBy: 'admin-9', senderName: 'Dev Admin' });
    expect(peopleOf(b, 'received')).toEqual([{ id: 'admin-9', name: 'Dev Admin' }]);
  });
});
