import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Página no encontrada</h1>
      <p className="my-4">
        <Link href="/">Volver al temario</Link>
      </p>
    </>
  );
}
