import { Link } from "react-router-dom";

import officialLogo from "@/assets/logo-transparent.png";
import { SCHOOL } from "@/data/school";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <img
        src={officialLogo}
        alt={SCHOOL.name}
        className="h-12 w-12 object-contain object-center"
      />
      <span className="text-lg font-bold tracking-tight text-ink">
        {SCHOOL.shortName}
      </span>
    </Link>
  );
}
