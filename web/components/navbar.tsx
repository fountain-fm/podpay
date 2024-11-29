import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";

import { GithubIcon } from "./icons";

export const Navbar = () => {
  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit pr-4">
          <Link color="foreground" href="/">
            <p className="font-bold">Pod Pay</p>
          </Link>
        </NavbarBrand>
        <NavbarItem>
          <Link color="foreground" href="/demo">
            Demo
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent
        className="hidden sm:flex gap-4"
        justify="start"
      ></NavbarContent>
      <NavbarContent className="basis-full" justify="end">
        <Link
          isExternal
          aria-label="Github"
          href="https://github.com/fountain-fm/podpay"
        >
          <GithubIcon className="text-white" />
        </Link>
      </NavbarContent>
    </NextUINavbar>
  );
};
