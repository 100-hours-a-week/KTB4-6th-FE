import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
  children: string;
}

const getSafeExternalHref = (href?: string) => {
  if (!href) return null;

  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

const ListItem = ({ children }: { children?: ReactNode }) => (
  <li className="pl-0.5 marker:text-cool-500">{children}</li>
);

const SafeLink = ({ href, children }: ComponentPropsWithoutRef<'a'>) => {
  const safeHref = getSafeExternalHref(href);

  if (!safeHref) return <span>{children}</span>;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-brand-700 underline underline-offset-2"
    >
      {children}
    </a>
  );
};

export const ChatMarkdown = ({ children }: ChatMarkdownProps) => (
  <ReactMarkdown
    skipHtml
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children: content }) => (
        <h1 className="mt-4 mb-2 text-lg font-bold first:mt-0">{content}</h1>
      ),
      h2: ({ children: content }) => (
        <h2 className="mt-4 mb-2 text-base font-bold first:mt-0">{content}</h2>
      ),
      h3: ({ children: content }) => (
        <h3 className="mt-3 mb-1.5 font-bold first:mt-0">{content}</h3>
      ),
      p: ({ children: content }) => <p className="my-2 first:mt-0 last:mb-0">{content}</p>,
      ul: ({ children: content }) => <ul className="my-2 list-disc space-y-1 pl-5">{content}</ul>,
      ol: ({ children: content }) => (
        <ol className="my-2 list-decimal space-y-1 pl-5">{content}</ol>
      ),
      li: ListItem,
      strong: ({ children: content }) => <strong className="font-bold">{content}</strong>,
      blockquote: ({ children: content }) => (
        <blockquote className="my-2 border-l-2 border-brand-300 pl-3 text-cool-700">
          {content}
        </blockquote>
      ),
      code: ({ children: content }) => (
        <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[0.85em] break-all">
          {content}
        </code>
      ),
      pre: ({ children: content }) => (
        <pre className="my-2 overflow-x-auto rounded-lg bg-cool-900 p-3 text-xs text-white [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
          {content}
        </pre>
      ),
      table: ({ children: content }) => (
        <div className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">{content}</table>
        </div>
      ),
      th: ({ children: content }) => (
        <th className="border border-cool-300 bg-white/70 px-2 py-1.5 font-semibold">{content}</th>
      ),
      td: ({ children: content }) => (
        <td className="border border-cool-300 px-2 py-1.5">{content}</td>
      ),
      a: SafeLink,
      img: ({ alt }) => <span>{alt}</span>,
    }}
  >
    {children}
  </ReactMarkdown>
);
