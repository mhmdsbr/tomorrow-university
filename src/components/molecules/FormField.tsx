import type { ComponentProps } from "react";

type FormFieldProps = { label: string; id: string } & (
  | ({ multiline?: false } & ComponentProps<"input">)
  | ({ multiline: true } & ComponentProps<"textarea">)
);

export default function FormField({ label, id, ...props }: FormFieldProps) {
  const className =
    "w-full min-w-0 rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm leading-relaxed text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-100";
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
