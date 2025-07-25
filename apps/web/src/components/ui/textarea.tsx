import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string
}
function Textarea({ className, label, error, ...props }: TextareaProps) {
  const textareaId = props.id || ""; // Ensure id is passed to textarea if provided
  return (
    <div className="">
      <label htmlFor={textareaId} className='text-sm font-medium' >{label}</label>
      <textarea
        id={textareaId}
        data-slot="textarea"
        className={cn(
          "border-input mt-1 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-action/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
    </div>

  )
}

export { Textarea }
