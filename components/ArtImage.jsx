import { getImageProps } from 'next/image';

// Art-directed image: the design crops each photo differently for desktop and mobile.
export default function ArtImage({ desktop, mobile, alt, className, desktopSizes, mobileSizes, priority = false }) {
  const common = { alt, priority };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: desktop, sizes: desktopSizes });
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, src: mobile, sizes: mobileSizes });

  return (
    <picture>
      <source media="(min-width: 1100px)" srcSet={desktopSrcSet} sizes={desktopSizes} />
      <source media="(max-width: 1099.98px)" srcSet={mobileSrcSet} sizes={mobileSizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...rest} className={className} />
    </picture>
  );
}
