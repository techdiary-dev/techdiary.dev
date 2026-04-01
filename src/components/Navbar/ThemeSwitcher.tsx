"use client";

import { useTranslation } from "@/i18n/use-translation";
import { LightbulbIcon, MonitorIcon, MoonIcon } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const ThemeSwitcher = () => {
  const { _t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const renderIcon = () => {
    switch (theme) {
      case "light":
        return <LightbulbIcon />;
      case "dark":
        return <MoonIcon />;
      case "system":
        return <MonitorIcon />;
      default:
        return <MonitorIcon />;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"}>{renderIcon()}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{_t("Color Theme")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <MonitorIcon />
            {_t("System")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <LightbulbIcon />
            {_t("Light")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <MoonIcon />
            {_t("Dark")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ThemeSwitcher;
