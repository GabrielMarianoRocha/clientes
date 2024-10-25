import { Text, TextProps } from "@ui-kitten/components";
import { EvaStatus } from "@ui-kitten/components/devsupport";

type Props = TextProps & {
  isError?: boolean;
  status?: EvaStatus;
  show?: boolean;
};

export default function HelpText({
  children,
  status = "basic",
  isError = false,
  show = false,
  ...props
}: Props) {
  return (
    show && (
      <Text
        category="s2"
        appearance="hint"
        status={!!isError ? "danger" : status}
        {...props}
      >
        {children}
      </Text>
    )
  );
}
