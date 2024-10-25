import { Text, TextProps } from '@ui-kitten/components';

type Props = TextProps & {
  children: React.ReactNode;
  required?: boolean;
};

export default function Label({ children, required, ...props }: Props) {
  return (
    <Text
      category="label"
      style={{
        marginTop: 15,
        fontSize: 16,
      }}
      {...props}
    >
      <>
        {children} {required && <Text status="danger">*</Text>}
      </>
    </Text>
  );
}
