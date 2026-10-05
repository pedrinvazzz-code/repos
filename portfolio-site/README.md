# pedrinvazzz-code.github.io

Portfólio de Pedro Henrique Borges, publicado em **https://pedrinvazzz-code.github.io**.

O site é HTML, CSS e JavaScript puros, sem etapa de build. O GitHub Pages publica direto da branch `main`.

## Como editar

Quase tudo que aparece no site está em **`assets/js/data.js`**:

| O que mudar | Onde, dentro de `data.js` |
|---|---|
| Título do topo e frase de apresentação | `hero` |
| Projetos (lista e página de cada um) | `projects` |
| Abas da stack | `stack` |
| Texto do "Sobre" | `about` |
| Certificados | `certificates` |
| E-mail, GitHub, LinkedIn e Instagram | `email` e `contacts` |
| Texto da pílula "Disponível para trabalho" | `status` e `statusShort` |

### Adicionar um projeto

Copie um item de `projects` e troque os campos:

- `id`: nome curto, sem espaços. Vira o link `#/projeto/<id>`.
- `tags`: até 3 palavras curtas, aparecem na lista.
- `stack`: lista completa, aparece na página do projeto.
- `media`: imagens (opcional). Coloque o arquivo em `assets/img/` e informe `width` e `height` reais.
- `sections`: blocos de título e texto da página do projeto.

### O título que se edita sozinho

`hero.start` é o texto inicial e `hero.edits` lista as trocas: quem edita (`etl` ou `pedro`), o trecho procurado (`find`) e o novo texto (`replace`). Com `serif: true`, o trecho novo aparece em itálico serifado.

## Rodar no computador

```bash
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Estrutura

```
index.html             estrutura da página
assets/css/style.css   visual
assets/js/data.js      conteúdo
assets/js/main.js      interações
assets/fonts/          Public Sans, Geist Mono e Instrument Serif (hospedadas aqui)
assets/img/            prints dos projetos
```

## Créditos

O design segue a linguagem visual de [akshatsingh.site](https://www.akshatsingh.site/), adaptado para engenharia de dados.
Fontes: Public Sans, Geist Mono e Instrument Serif, todas sob a SIL Open Font License.
