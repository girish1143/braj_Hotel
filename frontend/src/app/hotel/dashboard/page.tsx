import HotelAdminClient from '../../../components/hotel-admin/HotelAdminClient';

export const metadata = {
  title: 'Hotel PMS Dashboard | Brijnidhi Hotel Partner',
  description: 'Braj Pilgrimage Hotel Management System & Operational Control',
};

export default function HotelDashboardPage() {
  return <HotelAdminClient initialRoute="dashboard" basePath="/hotel/dashboard" />;
}
