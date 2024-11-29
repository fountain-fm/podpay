export const Link = (props: { text: string; href: string }) => {
  const { text, href } = props;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};
