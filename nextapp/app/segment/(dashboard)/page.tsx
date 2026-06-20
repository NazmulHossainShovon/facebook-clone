import { redirect } from 'next/navigation';

export default function SegmentDashboardIndexPage() {
  redirect('/segment/sources');
}
