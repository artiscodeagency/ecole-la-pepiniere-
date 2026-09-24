import { Link } from "react-router-dom";

import officialLogo from "@/assets/logo-transparent.png";
import { useSchool } from "@/data/useSchool";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const school = useSchool();

  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <img
        src={officialLogo}
        alt={school.name}
        className="h-12 w-12 object-contain object-center"
      />
      <span className="whitespace-nowrap text-base font-bold tracking-tight text-ink min-[360px]:text-lg">
        {school.shortName}
      </span>
    </Link>
  );
}
