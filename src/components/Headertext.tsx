import "./css/header.css"

interface HeaderProps {
  title: string[]; // each line as an element
  children?: React.ReactNode;
}

export default function Headertext({ title, children }: HeaderProps) {
  return (
    <header>
      <h1 className="fluid font-bold">
        {title.map((line, idx) => (
          <span key={idx}>
            {line}
            <br />
          </span>
        ))}
      </h1>
      {children}
    </header>
  );
}
