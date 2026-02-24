import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import { DefaultWrapper } from '@/lib/styledComponents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTrackableHandlers } from '@tyl/helpers/data/dbHooksTanstack';
import { MutationError } from '@/components/form/mutationError';

type TrackableType = 'boolean' | 'number' | 'text';
const options = [
  {
    value: 'boolean' as const,
    title: 'Boolean',
    description:
      'True or false. Can be used for habit tracking or as a checkbox.',
  },
  {
    value: 'number' as const,
    title: 'Number',
    description:
      'Can represent count like steps walked, measurement like weight, or rating like mood.',
  },
  {
    value: 'text' as const,
    title: 'Text',
    description:
      'Simple text for each day. You can use it as a note or a gratitude journal.',
  },
];

const TrackableTypeSelector = ({
  type,
  setType,
}: {
  type: TrackableType;
  setType: (nextType: TrackableType) => void;
}) => {
  return (
    <View className="flex flex-col gap-3">
      {options.map((option) => {
        const selected = option.value === type;
        return (
          <Pressable
            key={option.value}
            onPress={() => setType(option.value)}
            className={cn(
              'rounded-md border-2 border-border bg-card p-4',
              selected && 'border-primary bg-accent/20'
            )}
          >
            <Text className="text-lg font-semibold text-foreground">
              {option.title}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              {option.description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const CreateScreen = () => {
  const router = useRouter();
  const { createTrackable } = useTrackableHandlers();

  const [newOne, setNewOne] = useState<{ type: TrackableType; name: string }>({
    type: 'boolean',
    name: '',
  });

  const mutation = useMutation({
    mutationFn: async (payload: { name: string; type: TrackableType }) => {
      return await createTrackable({
        name: payload.name,
        type: payload.type,
        bucketing: 'day',
      });
    },
    onSuccess: (id) => {
      router.push({ pathname: '/trackable/[id]', params: { id } });
      console.log('id', id);
    },
  });

  const setType = (type: TrackableType) => {
    setNewOne((prev) => ({ ...prev, type }));
  };

  const handleCreate = () => {
    mutation.mutate({
      name: newOne.name || '',
      type: newOne.type,
    });
  };

  return (
    <DefaultWrapper>
      <View className="flex flex-col gap-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground">
          Create new Trackable
        </Text>

        <Input
          placeholder="Unnamed Trackable"
          value={newOne.name}
          onChangeText={(value) =>
            setNewOne((prev) => ({ ...prev, name: value }))
          }
        />

        <TrackableTypeSelector type={newOne.type} setType={setType} />

        <Button
          className="mt-2"
          text="Create"
          onPress={handleCreate}
          loading={mutation.isPending}
        />
        <MutationError mutation={mutation} className="mt-2" />
      </View>
    </DefaultWrapper>
  );
};

export default CreateScreen;
