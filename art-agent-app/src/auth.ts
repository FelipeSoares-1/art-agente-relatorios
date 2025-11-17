import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const allowedDomains = ["artplan.com.br", "grupodreamers.com.br"];

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        console.log("Login negado: Usuário sem e-mail.");
        return false;
      }

      const emailDomain = user.email.split('@')[1];
      if (allowedDomains.includes(emailDomain)) {
        console.log(`Login permitido para: ${user.email}`);
        return true;
      } else {
        console.log(`Login negado: Domínio de e-mail não autorizado (${emailDomain}).`);
        // Em vez de retornar false (que mostraria uma página de erro genérica),
        // podemos redirecionar para uma página de acesso negado customizada.
        // Por enquanto, retornaremos false.
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV !== 'production', // Descomente para logs detalhados
});