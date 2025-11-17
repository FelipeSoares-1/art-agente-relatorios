import { auth } from '@/auth';

export default auth((req) => {
  // A verificação `!req.auth` redireciona usuários não autenticados
  // para a página de login padrão do NextAuth.
  // As rotas protegidas são definidas no objeto de configuração abaixo.
});

// O matcher define quais rotas são protegidas pelo middleware
export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas, exceto as que começam com:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone de favicon)
     * Isso protege todas as páginas por padrão.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
