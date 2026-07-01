"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Password field with a show/hide toggle. Forwards its ref and spreads props, so it
 * drops in wherever an `<Input type="password">` is used (RHF `register` or a
 * `Controller` field). Used by every password field in the app.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<"input">, "type">>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    );
  },
);
