<div align="center">

# 📐 readme-style

## Mantenha todo README do seu perfil GitHub no mesmo padrão visual, sem esforço

*header centralizado · badges reais · sumário · seções com emoji · zero invenção*

<br/>

![Claude Code](https://img.shields.io/badge/Claude_Code-plugin-d97757?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

> READMEs bons custam tempo, e sem um padrão cada repo acaba com um nível diferente de
> capricho — alguns caprichados, outros esquecidos. **readme-style** resolve isso: um
> comando que lê o código de verdade e escreve o README no mesmo formato consistente,
> mais um aviso automático (sem escrever nada sozinho) toda vez que você abrir um projeto
> cujo README ainda não está nesse padrão.

```console
$ cd meu-projeto && claude

SessionStart: O README deste projeto não está no seu padrão pessoal
(header centralizado, badges, sumário) — rode /readme-style:apply pra atualizar.

> /readme-style:apply
  Lendo o código real do projeto...
  ✓ README.md atualizado no padrão.
```

---

## 📋 Sumário

- [✨ Funcionalidades](#-funcionalidades)
- [🧠 Como funciona](#-como-funciona)
- [📦 Instalação](#-instalação)
- [🚀 Uso](#-uso)
- [🎨 O padrão gerado](#-o-padrão-gerado)
- [🗂️ Estrutura do projeto](#️-estrutura-do-projeto)

---

## ✨ Funcionalidades

| | |
|---|---|
| 🔍 **Aviso automático** | Ao abrir qualquer projeto no Claude Code, um hook silencioso verifica se o README existe e está no padrão — e só *sugere* rodar o comando. Nunca escreve nada sozinho, nunca trava a sessão. |
| ✍️ **Geração baseada no código real** | O comando `/readme-style:apply` lê o código de verdade do projeto (dependências, entry points, módulos) antes de escrever — nada de funcionalidade inventada. |
| 🎨 **Um padrão visual único** | Header centralizado, badges reais (sem métricas falsas de teste/versão), sumário com âncoras, seções com emoji, blocos `<details>` para conteúdo longo. |
| 🤷 **Honesto com repositórios vazios** | Um repo em estágio inicial recebe um README curto e honesto, não uma estrutura forçada com seções vazias. |

---

## 🧠 Como funciona

- **Hook `SessionStart`** (`hooks/scripts/check-readme.mjs`) roda a cada sessão nova. Falha
  sempre em modo aberto: qualquer erro é engolido, nunca bloqueia o início da sessão.
  Verifica se o projeto é um repositório git, se tem `README.md`, e se esse README já tem
  as marcas do padrão (`align="center"` + badge `img.shields.io`). Se não tiver, imprime
  uma sugestão de uma linha.
- **Comando `/readme-style:apply`** (`commands/apply.md`) instrui o Claude a explorar o
  código do projeto e escrever/reescrever o `README.md` seguindo o template abaixo — e
  nada além disso: não commita, não mexe em outro arquivo.

---

## 📦 Instalação

```bash
claude plugin marketplace add brquatti/readme-style
claude plugin install readme-style@readme-style
```

Comandos de um plugin recém-instalado não ficam disponíveis na sessão que fez a instalação
— abra uma sessão nova (ou rode `/reload-plugins`) antes de usar `/readme-style:apply`.

---

## 🚀 Uso

Dentro de qualquer projeto:

```text
/readme-style:apply
```

Isso é tudo. O hook de `SessionStart` já avisa quando um README precisa de atenção, então
na prática você só roda o comando quando ele sugerir.

---

## 🎨 O padrão gerado

```text
<div align="center">

# <emoji> NomeDoApp
## <tagline forte, em negrito>
*<subtítulo em itálico, 3-5 palavras-chave>*

![badge] ![badge] ![badge]

</div>
---
> <parágrafo de abertura: o problema que o app resolve>
---
## 📋 Sumário          (só se o README tiver 5+ seções)
## ✨ Funcionalidades
## 🧠 Como funciona
## 📦 Instalação
## 🚀 Uso
## 🗂️ Estrutura do projeto

<div align="center">*<fechamento curto e honesto>*</div>
```

Regras que o comando sempre segue: nenhuma funcionalidade inventada, nenhuma seção de
License ou Autor/Contato, nenhum badge de "tests passing"/"version"/"PRs welcome" sem uma
CI ou versionamento público real por trás.

---

## 🗂️ Estrutura do projeto

```text
readme-style/
├─ .claude-plugin/
│  ├─ plugin.json        # manifesto do plugin + wiring do hook
│  └─ marketplace.json   # descrição do marketplace (este próprio repo)
├─ commands/
│  └─ apply.md           # /readme-style:apply
└─ hooks/
   └─ scripts/
      └─ check-readme.mjs   # aviso de SessionStart, fail-open
```

<div align="center">

*Projeto pessoal, aberto porque pode ser útil pra mais gente.*

</div>
