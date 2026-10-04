import { useState } from 'react';
import { router } from 'expo-router';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useUpdateProfile } from '@/hooks/useApiMutations';
import { errorMessage } from '@/services/api/errors';
import { useCurrentUser } from '@/store/AuthContext';
import { useToast } from '@/store/ToastContext';
import { haptics } from '@/utils/haptics';
import { formatMobile, isValidEmail } from '@/utils/validation';

export default function EditProfileScreen() {
  const user = useCurrentUser();
  const update = useUpdateProfile();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const dirty = name.trim() !== user.name || email.trim() !== (user.email ?? '');

  const save = () => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name';
    if (email.trim() && !isValidEmail(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length) {
      haptics.warning();
      return;
    }
    update.mutate(
      { name: name.trim(), email: email.trim() || null },
      {
        onSuccess: () => {
          haptics.success();
          toast.show('Profile updated', 'success');
          router.back();
        },
      },
    );
  };

  return (
    <Screen title="Edit profile" contentStyle={{ gap: 20, paddingTop: 16 }} footer={<Button label="Save changes" onPress={save} loading={update.isPending} disabled={!dirty} />}>
      <TextField label="Full name" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" textContentType="name" />
      <TextField label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
      <TextField label="Mobile number" value={`+91 ${formatMobile(user.mobile)}`} editable={false} helper="Your number identifies your demo profile and can't be changed." />
      {update.isError ? <Banner tone="error" title="Couldn't save" message={errorMessage(update.error)} /> : null}
    </Screen>
  );
}
