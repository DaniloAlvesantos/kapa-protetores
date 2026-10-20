# Testes E2E com Maestro (`@kapa/mobile-web`)

Este diretório armazena os fluxos E2E do [Maestro](https://maestro.mobile.dev) para validação de interface no Android/iOS e Web.

## Pré-requisitos

1. **Java 17+** instalado no sistema (`java -version`).
2. **Maestro CLI** instalado em `~/.maestro/bin/maestro`:
   ```bash
   curl -fsSL "https://get.maestro.mobile.dev" | bash
   export PATH="$PATH:$HOME/.maestro/bin"
   ```

## Executando os Fluxos

### Web (`http://localhost:8081`)

Com o servidor web do Expo rodando (`npm run dev` ou `npm run web`):

```bash
npm run test:maestro:web
```

### Android (`edu.fatec.kapaprotetores.android`)

Com um emulador Android ativo e o app instalado (`npm run android`):

```bash
npm run test:maestro
```

### Maestro Studio (Inspeção Interativa de Elementos)

Para inspecionar a árvore de elementos e gravar fluxos interativamente:

```bash
npm run maestro:studio --workspace=@kapa/mobile-web
```
