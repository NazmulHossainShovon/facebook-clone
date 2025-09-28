import DubNavbar from 'components/DubNavbar';

export default function DubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DubNavbar />
      <div>{children}</div>
    </div>
  );
}
