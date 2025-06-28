import { resetPassword } from '../src/firebase';

test('resetPassword sends a password reset email', async () => {
  const mockEmail = 'test@example.com';

  await resetPassword(mockEmail);

  // Verify that sendPasswordResetEmail was called
  expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, mockEmail);
});