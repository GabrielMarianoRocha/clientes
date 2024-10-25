import { Controller, useFormContext } from "react-hook-form";
import { Dimensions } from "react-native";
import {
  AutocompleteDropdown,
  AutocompleteDropdownProps,
} from "react-native-autocomplete-dropdown";
import Label from "../label";
import HelpText from "../helptext";

type Props = AutocompleteDropdownProps & {
  name: string;
  placeholder?: string;
  disabled?: boolean;
  helpText?: string;
  label?: string;
  required?: boolean;
};

export default function HFAutoComplete({
  name,
  placeholder,
  disabled = false,
  textInputProps,
  helpText,
  label = "",
  required = false,
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
          <AutocompleteDropdown
            {...field}
            onSelectItem={(item) =>
              setValue(name, item, {
                shouldValidate: !!item,
              })
            }
            inputHeight={60}
            clearOnFocus={false}
            useFilter={false}
            textInputProps={{
              placeholder: placeholder,
              editable: !disabled,
              value: field.value?.title,
              ...textInputProps,
            }}
            suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
            {...props}
            inputContainerStyle={{
              marginTop: 10,
              backgroundColor: disabled ? "#f2f2f2" : "white",
              borderWidth: 1,
              borderColor: !!error ? "red" : "#ebeced",
            }}
            rightButtonsContainerStyle={{
              display: disabled ? "none" : undefined,
            }}
          />
          <HelpText isError={!!error} show={!!(error || helpText)}>
            {!!error ? error?.message : helpText}
          </HelpText>
        </>
      )}
    />
  );
}
