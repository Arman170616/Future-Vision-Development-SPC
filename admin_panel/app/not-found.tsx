import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted">We’re sorry, but the requested page could not be found.</p>
      <Link href="/" className="btn-primary">Back to administration</Link>
    </div>
  );
}
