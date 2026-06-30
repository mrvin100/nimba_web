/**
 * The DRI route group has no shared chrome of its own: the login page renders
 * bare, and the authenticated area gets its sidebar from the nested (workspace)
 * layout. This keeps the group as an organizational boundary without a URL segment.
 */
export default function DriLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
