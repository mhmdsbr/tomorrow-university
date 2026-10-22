import type { ComponentProps } from "react";

type FormFieldProps = { label: string; id: string } & (
  | ({ multiline?: false } & ComponentProps<"input">)
  | ({ multiline: true } & ComponentProps<"textarea">)
);

export const fieldClassName =
  "w-full min-w-0 rounded-xl border border-brand-100 bg-white/80 px-4 py-3 text-sm leading-relaxed text-brand-950 outline-none transition-colors placeholder:text-brand-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 disabled:opacity-60 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-50";

export default function FormField({ label, id, ...props }: FormFieldProps) {
  const className = fieldClassName;
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
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {control}
    </div>
  );
}
