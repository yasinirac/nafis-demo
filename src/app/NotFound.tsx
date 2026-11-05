import { ButtonLink } from '@/components/Button';
import { SkipLink, TopBar } from './TopBar';

export function NotFound() {
  return (
    <div className="min-h-screen bg-ground">
      <SkipLink />
      <TopBar brand="NAFIS · concept demo" brandTo="/" persona={null} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[720px] px-6 py-16 focus:outline-none">
        <h1 className="m-0 text-[26px] font-bold">This screen is not in the demo</h1>
        <p className="mt-3 text-ink2">The address does not match a built screen. The platform map lists every screen that is built and every one that is planned.</p>
        <ButtonLink to="/" variant="primary" className="mt-6">
          Open the platform map
        </ButtonLink>
      </main>
    </div>
  );
}
