import ClubDetailClient from "./ClubDetailClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClubDetailClient id={id} />;
}
