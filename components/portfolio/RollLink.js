import Link from 'next/link';

export default function RollLink({ href, children, external }) {
  const inner = <span data-text={children}>{children}</span>;
  return external
    ? <a className="roll" href={href} target="_blank" rel="noopener">{inner}</a>
    : <Link href={href}><a className="roll">{inner}</a></Link>;
}