import { Link } from "@nextui-org/link";

export const Footer = () => {
  return (
    <footer className="w-full flex items-center justify-center text-xs py-3">
      <span className="text-default-600">Built by</span>
      <Link
        isExternal
        className="flex items-center gap-1 text-xs"
        href="https://fountain.fm"
        title="Fountain"
      >
        <span className="text-primary pl-1">Fountain</span>
      </Link>
      <span className="pl-1">/</span>
      <Link
        isExternal
        className="flex items-center gap-1 text-xs"
        href="https://primal.net/npub1unmftuzmkpdjxyj4en8r63cm34uuvjn9hnxqz3nz6fls7l5jzzfqtvd0j2"
        title="Fountain"
      >
        <span className="text-nostr pl-1">MerryOscar</span>
      </Link>
    </footer>
  );
};
