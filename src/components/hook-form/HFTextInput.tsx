import { Input, InputProps } from '@ui-kitten/components';
import { Controller, useFormContext } from 'react-hook-form';
import Label from '../label';
import HelpText from '../helptext';

type Props = InputProps & {
  name: string;
  label?: string;
  required?: boolean;
  helpText?: string;
};

export default function HFTextInput({
  name,
  required = false,
  label = '',
  helpText,
  onChange,
  ...props
}: Props) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <Label required={required}>{label}</Label>
          <Input
            {...field}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            style={{ marginTop: 10 }}
            textStyle={{ height: 45 }}
            size="large"
            status={!!error ? 'danger' : 'basic'}
            onChangeText={(text) => setValue(name, text)}
            {...props}
          />
          <HelpText isError={!!error} show={!!(error || helpText)}>
            {!!error ? error?.message : helpText}
          </HelpText>
        </>
      )}
    />
  );
}
