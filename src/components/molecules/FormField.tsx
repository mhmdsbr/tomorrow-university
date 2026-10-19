import type { ComponentProps } from "react";

type FormFieldProps = { label: string; id: string } & (
  | ({ multiline?: false } & ComponentProps<"input">)
  | ({ multiline: true } & ComponentProps<"textarea">)
);

export default function FormField({ label, id, ...props }: FormFieldProps) {
  const className = "rounded-md border border-zinc-400 p-3";
  let control;

  if (props.multiline) {
    const { multiline, ...textareaProps } = props;
    void multiline;
    control = <textarea {...textareaProps} id={id} className={className} />;
  } else {
    const { multiline, ...inputProps } = props;
    void multiline;
    control = <input {...inputProps} id={id} className={className} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      {control}
    </div>
  );
}
