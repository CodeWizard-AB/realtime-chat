export default async function Room({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	return <div>{slug}</div>;
}
