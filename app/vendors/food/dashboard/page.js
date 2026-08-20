import { redirect } from 'next/navigation';

export default function FoodVendorRootPage() {
  redirect('/vendors/food/dashboard/home');
}