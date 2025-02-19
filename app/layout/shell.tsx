
interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="flex-1">
        <main className="container py-6 md:py-8">{children}</main>
      </div>

    </div>
  );
}
