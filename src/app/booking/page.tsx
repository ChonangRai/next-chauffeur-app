import { redirect } from "next/navigation";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { booking_ref?: string };
}) {
  if (searchParams.booking_ref) {
    redirect(`/booking/${searchParams.booking_ref}`);
  }
  redirect("/");
}
