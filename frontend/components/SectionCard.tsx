import { ReactNode } from "react";

type SectionCardProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function SectionCard({ id, title, children }: SectionCardProps) {
  return (
    <section id={id} className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
