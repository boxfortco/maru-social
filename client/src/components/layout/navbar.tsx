import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleDashed, User, Compass, Radio, Plus } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import ProjectCreator from "@/components/projects/project-creator";

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="flex items-center gap-2 font-semibold">
              <CircleDashed className="h-6 w-6" />
              <span>ShowYourWork</span>
            </a>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/discover">
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Compass className="h-5 w-5" />
                <span>Discover</span>
              </a>
            </Link>
            <Link href="/channels">
              <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Radio className="h-5 w-5" />
                <span>Channels</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ProjectCreator />
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-medium">
                {user?.username}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}