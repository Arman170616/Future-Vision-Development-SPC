/** Admin-entered text with light markdown: "## Heading" lines become headings, **bold** markers are dropped, the rest keeps its line breaks. */
const RichText = ({ text, className = '' }: { text?: string | null; className?: string }) => {
  const blocks = (text ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, i) => {
        const heading = block.match(/^#{1,6}\s+(.+)$/);
        if (heading) return <h4 key={i} dir="auto" className="text-lg font-semibold text-white">{heading[1]}</h4>;
        // A heading line followed directly by text, without a blank line between
        const lead = block.match(/^#{1,6}\s+(.+)\n([\s\S]+)$/);
        if (lead) {
          return (
            <div key={i}>
              <h4 dir="auto" className="text-lg font-semibold text-white mb-2">{lead[1]}</h4>
              <p dir="auto" className="text-blue-100 leading-relaxed whitespace-pre-line">{lead[2]}</p>
            </div>
          );
        }
        return <p key={i} dir="auto" className="text-blue-100 leading-relaxed whitespace-pre-line">{block}</p>;
      })}
    </div>
  );
};

export default RichText;
