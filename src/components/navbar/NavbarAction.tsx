"use client";

import { http } from "@/http/http.client";
import { HomeIcon, MoonIcon, PlusIcon, SunIcon } from "@radix-ui/react-icons";

import { userAtom } from "@/store/user.atom";
import {
  Avatar,
  Button,
  Menu,
  Text,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { AiFillGithub, AiOutlineGoogle } from "react-icons/ai";
import {
  HiLogout,
  HiOutlineBookmark,
  HiOutlineCog,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { AuthRepository } from "@/http/repositories/auth.repository";
import { setLanguage } from "@/i18n/i18n.server-action";
import { i18nLangAtom } from "@/store/i18n-lang.atom";

const NavbarAction = () => {
  const currentUser = useAtomValue(userAtom);
  const { setColorScheme } = useMantineColorScheme();
  const [i18nLang, setI18nLang] = useAtom(i18nLangAtom);
  const computedColorScheme = useComputedColorScheme();
  const handleSwitchLanguage = () => {
    let _i18nLang = i18nLang === "en" ? "bn" : "en";
    setI18nLang(_i18nLang as "en" | "bn");
    setLanguage(_i18nLang as "en" | "bn");
  };

  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-forground-muted">
          <HomeIcon height={25} width={25} />
        </Link>

        <UnstyledButton
          className="text-forground-muted"
          onClick={() =>
            setColorScheme(computedColorScheme === "light" ? "dark" : "light")
          }
        >
          {computedColorScheme == "dark" ? (
            <SunIcon height={25} width={25} />
          ) : (
            <MoonIcon height={24} width={24} />
          )}
        </UnstyledButton>
      </div>
      <Button
        className="hidden md:inline-block"
        leftSection={<PlusIcon height={22} width={22} />}
        onClick={() => {
          alert("not implemented");
        }}
      >
        নতুন ডায়েরি
      </Button>

      {/* <button onClick={handleSwitchLanguage}>Click me</button> */}

      {currentUser ? (
        <>
          <AuthenticatedMenu />
        </>
      ) : (
        <UnAuthenticatedMenu />
      )}
    </div>
  );
};

export default NavbarAction;

const AuthenticatedMenu = () => {
  const [currentUser, setCurrentUser] = useAtom(userAtom);
  const authApi = new AuthRepository();

  const handleLogout = async () => {
    modals.openConfirmModal({
      title: "লগআউট করতে চাচ্ছেন?",
      children: (
        <Text size="sm">
          একবার লগাউট করে ফেললে আপনাকে আবার নতুন করে লগইন করতে হবে
        </Text>
      ),
      labels: { confirm: "লগ আউট করতে চাই", cancel: "না" },
      onCancel: () => console.log("না"),
      onConfirm: () => {
        authApi.logout().finally(() => {
          setCurrentUser(null);
        });
      },
      confirmProps: { color: "red" },
    });
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar
            alt="T"
            radius={"sm"}
            src={
              currentUser?.profilePhoto ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser?.username}`
            }
          />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          href={`@${currentUser?.username || ""}`}
          leftSection={<HiOutlineUserCircle size={18} />}
        >
          আমার প্রোফাইল
        </Menu.Item>
        <Menu.Item leftSection={<MdOutlineDashboard size={18} />}>
          ড্যাসবোর্ড
        </Menu.Item>
        <Menu.Item leftSection={<HiOutlineBookmark size={18} />}>
          বুকমার্ক সমূহ
        </Menu.Item>
        <Menu.Item leftSection={<HiOutlineCog size={18} />}>সেটিং</Menu.Item>
        <Menu.Item
          leftSection={<HiLogout size={18} />}
          component="button"
          onClick={handleLogout}
        >
          লগ আউট
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const UnAuthenticatedMenu = () => {
  const handleLogin = async (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth/${provider}`;
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar radius={"sm"} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component="button"
          onClick={() => {
            handleLogin("github");
          }}
          leftSection={<AiFillGithub size={18} />}
        >
          গিটহাব দিয়ে লগইন
        </Menu.Item>
        <Menu.Item
          component="button"
          onClick={() => handleLogin("google")}
          leftSection={<AiOutlineGoogle size={18} />}
        >
          গুগল দিয়ে লগইন
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
