"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionUser } from "@/lib/_types";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

type UserDropdownProps = {
  user: SessionUser;
  logout: () => Promise<void>;
};

export default function DropdownUser(props: UserDropdownProps) {
  const router = useRouter();

  if (!props.user) return;

  async function handleLogout() {
    await props.logout();

    router.push("/auth");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className="relative h-8 flex items-center justify-between w-full space-x-2 !px-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User
                className="
                text-white
                "
              />
            </AvatarFallback>
          </Avatar>

          <div
            className="
            overflow-hidden
            flex flex-col flex-1 space-y-1
            text-left
            cursor-pointer
            "
          >
            {props.user.name && (
              <p
                className="
                text-sm font-medium text-white
                "
              >
                {props.user.name}
              </p>
            )}
            <p
              className="
              max-w-full
              overflow-hidden
              text-sm text-muted-foreground
              "
            >
              {props.user.email}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-secondary" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {props.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {props.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500 cursor-pointer"
          onClick={() => handleLogout()}
        >
          {/*<LockClosedIcon className="w-3 h-3 mr-3" />*/}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
