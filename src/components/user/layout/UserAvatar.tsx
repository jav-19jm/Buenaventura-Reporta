import type { Perfil } from "../../../types";
import { cn } from "../../../lib/utils";

interface UserAvatarProps {
  profile: Pick<Perfil, "nombre_completo" | "url_avatar"> | null;
  className?: string;
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function UserAvatar({ profile, className }: UserAvatarProps) {
  if (profile?.url_avatar) {
    return (
      <img
        src={profile.url_avatar}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white", className)}
    >
      {initials(profile?.nombre_completo)}
    </span>
  );
}
