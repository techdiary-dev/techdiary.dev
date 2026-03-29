import Link, { LinkProps } from "next/link";
import React, { PropsWithChildren } from "react";

interface HoverPrefetchLinkProps extends LinkProps {}

const HoverPrefetchLink: React.FC<PropsWithChildren<HoverPrefetchLinkProps>> = (
  props
) => {
  const [active, setActive] = React.useState(false);
  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
    >
      {props.children}
    </Link>
  );
};

export default HoverPrefetchLink;
