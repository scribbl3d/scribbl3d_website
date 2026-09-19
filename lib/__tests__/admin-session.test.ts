import { execFileSync } from 'node:child_process';

it('verifies signed admin sessions and rejects unsigned, tampered, expired, non-admin and cross-origin requests in the Node runtime', () => {
  const output = execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', `
    import assert from 'node:assert/strict';
    import { SignJWT } from 'jose';
    import adminSession from './lib/admin-session.ts';
    const { createAdminSession, verifyAdminSession, isAdminRequest, isSameOrigin } = adminSession;
    const secret = process.env.JWT_SECRET;
    const key = new TextEncoder().encode(secret);
    const token = await createAdminSession('admin@example.test');
    assert.deepEqual(await verifyAdminSession(token), { email: 'admin@example.test', role: 'admin' });
    assert.equal(await verifyAdminSession(), null);
    assert.equal(await verifyAdminSession(JSON.stringify({ email: 'admin@example.test', role: 'admin' })), null);
    assert.equal(await verifyAdminSession('invalid'), null);
    assert.equal(await verifyAdminSession(token.slice(0, -8) + 'tampered'), null);
    for (const [role, issuer, audience, expiry] of [
      ['user', 'scribbl3d-admin', 'scribbl3d-operations', '1h'],
      ['admin', 'customer-session', 'scribbl3d-operations', '1h'],
      ['admin', 'scribbl3d-admin', 'other-app', '1h'],
      ['admin', 'scribbl3d-admin', 'scribbl3d-operations', '-1h'],
    ]) {
      const invalid = await new SignJWT({ email: 'admin@example.test', role }).setProtectedHeader({ alg: 'HS256' }).setIssuer(issuer).setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(key);
      assert.equal(await verifyAdminSession(invalid), null);
    }
    const request = (origin) => ({ url: 'https://www.scribbl3d.com/api/announcements', headers: { get: (name) => (name === 'origin' ? origin : name === 'host' ? 'www.scribbl3d.com' : null) }, cookies: { get: () => ({ value: token }) } });
    assert.equal(await isAdminRequest(request('https://www.scribbl3d.com')), true);
    assert.equal(await isAdminRequest(request('https://evil.example')), false);
    assert.equal(isSameOrigin(request(null)), true);
    const proxied = { headers: { get: (name) => (name === 'origin' ? 'https://www.scribbl3d.com' : name === 'x-forwarded-host' ? 'www.scribbl3d.com' : name === 'host' ? '127.0.0.1:3000' : null) } };
    assert.equal(isSameOrigin(proxied), true);
    delete process.env.JWT_SECRET;
    process.env.NEXTAUTH_SECRET = secret;
    assert.ok(await verifyAdminSession(await createAdminSession('admin@example.test')));
    delete process.env.NEXTAUTH_SECRET;
    await assert.rejects(createAdminSession('admin@example.test'), /not configured/);
    assert.equal(await verifyAdminSession(token), null);
    console.log('Admin session verification passed');
  `], { cwd: process.cwd(), encoding: 'utf8', env: { ...process.env, JWT_SECRET: 'test-only-admin-session-signing-key-32-characters', NEXTAUTH_SECRET: '' } });
  expect(output).toContain('Admin session verification passed');
}, 15000);
