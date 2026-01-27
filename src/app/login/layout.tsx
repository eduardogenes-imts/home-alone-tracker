export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout limpo sem header/navbar para a pagina de login
  return <>{children}</>;
}
