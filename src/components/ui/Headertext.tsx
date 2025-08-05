import "../css/header.css"
import BlurText from "../BlurText"

interface HeaderProps {
  title: string; // each line as an element
  children?: React.ReactNode;
}

export default function Headertext({ title, children }: HeaderProps) {
  return (
    <header className="min-h-screen flex mt-0 md:-mt-20 justify-center flex-col w-full px-4 md:px-20">
      <h1 className="fluid font-bold">
        <BlurText
          text={title}
          delay={50}
          animateBy="words"
          direction="bottom"
          gradient={true}
        />
      </h1>
      {children}
    </header>
  );
}
