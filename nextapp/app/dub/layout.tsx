import DubNavbar from 'components/DubNavbar';

export default function DubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DubNavbar />
      <div className="pt-16">{children}</div>
    </div>
  );
}
