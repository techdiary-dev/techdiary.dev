import Link from "next/link";
import TechdiaryLogo from "../logos/TechdiaryLogo";

import NavbarActions from "./NavbarActions";
import SearchInput from "./SearchInput";

interface NavbarProps {
  Trailing?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ Trailing }) => {
  return (
    <div className="sticky left-0 top-0 z-30 w-full border-b border-border bg-background">
      <div className="h-12 flex items-center justify-between wrapper gap-3">
        <div className="flex items-center gap-1">
          {Trailing}
          <Link href="/" className="flex items-center gap-2">
            <TechdiaryLogo />
            <span className="text-lg font-semibold text-foreground">
              Techdiary
            </span>
          </Link>
        </div>
        <SearchInput />
        <NavbarActions />
      </div>
    </div>
  );
};

export default Navbar;
