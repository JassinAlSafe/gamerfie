interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex-1">
      <main className="py-6 md:py-8">{children}</main>
    </div>
  );
}
