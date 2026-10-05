# Repositórios e ferramentas

## image-blaster

- **Link:** https://github.com/neilsonnn/image-blaster
- **Tipo:** repositório (ferramenta com Claude skills)
- **Tags:** 3D, IA generativa, game dev, áudio, Gaussian splat, Claude skill
- **Status:** ✅ verificado
- **Adicionado em:** 2026-10-05
- **Licença:** MIT. Cerca de 9 mil estrelas e 889 forks quando foi adicionado.

**O que é:** transforma **uma única imagem** em um ambiente 3D completo em menos de 5 minutos, com modelos, cenário e som.
Usa skills do Claude junto com as APIs da World Labs e da FAL.

**O que gera:**

| Saída | Formato |
|---|---|
| Objetos 3D (modelos dinâmicos) | `.glb`, `.obj` |
| Cenário estático (Gaussian splat) | `.spz` |
| Som ambiente em loop + efeitos sonoros de física | `.mp3` |

**Modelos usados:**
- World Labs **marble-1.1**: gera o ambiente a partir da imagem.
- **nano-banana**: edita a imagem.
- **Hunyuan-3D**, via FAL: gera os modelos 3D.
- **ElevenLabs** sound effects: gera os sons.
- Inclui um visualizador em React e usa Bun como runtime.

**Como usar:**
1. `git clone https://github.com/neilsonnn/image-blaster`
2. Rodar o Claude Code com as chaves de API da **World Labs** e da **FAL**.
3. Colocar uma imagem na pasta `input/`.
4. Pedir ao Claude: "blast it".

**Quando usar:** prototipar cenários de jogo, gerar assets 3D rápidos, montar cenas 3D para sites (Three.js) ou criar ambientes a partir de concept art.
Os arquivos gerados funcionam em Unity, Unreal, Godot, Blender, Three.js e outras engines ou programas 3D.

**Notas:** as APIs da World Labs e da FAL cobram por uso.

---

## 5min-btc-polymarket

- **Link:** https://github.com/Novals83/5min-btc-polymarket
- **Tipo:** repositório (skill do OpenClaw / bot de trading)
- **Tags:** trading, Polymarket, Bitcoin, mercados de previsão, bot, momentum
- **Status:** ❌ **fora do ar**. Em 2026-10-05 o link dava 404: o repositório foi apagado, tornado privado ou renomeado.
  As informações abaixo vêm da descrição que ainda estava nos resultados de busca.
- **Adicionado em:** 2026-10-05

**O que é:** uma skill do **OpenClaw** que opera nos mercados de **BTC de 5 minutos** da Polymarket ("BTC Up/Down").
Segue uma estratégia de momentum, tem controles de risco configuráveis e lógica de hedge opcional.

**Estratégia ("momentum-into-close"):**
- Opera perto do vencimento de cada intervalo de 5 min. A janela principal de entrada é com **cerca de 2 minutos restantes**.
- Antes de entrar, confirma que o BTC **já se moveu entre US$ 70 e US$ 100** no intervalo atual.
- Também verifica o **skew** do mercado, ou seja, para que lado as apostas estão pendendo, e entra a favor do movimento.

**Estrutura do repositório:**
- `SKILL.md`: definição da skill.
- `config/`: perfis e parâmetros de risco.
- `scripts/`: scripts para rodar a skill.
- `examples/`: exemplos de comandos.

**Quando usar:** como referência para montar um bot de mercados de previsão de curto prazo, ou para estudar estratégia de momentum e gestão de risco.

**⚠️ Atenção:** opera com dinheiro real em mercados muito voláteis. Não há garantia de lucro.

**Alternativas parecidas** (encontradas na busca; não foram abertas nem verificadas):
- https://github.com/ThinkEnigmatic/polymarket-bot-arena: arena de bots adaptativos para os mercados BTC de 5 min.
- https://github.com/KaustubhPatange/polymarket-trade-engine: motor de trading automático para mercados binários da Polymarket.
- https://github.com/aulekator/Polymarket-BTC-15-Minute-Trading-Bot: bot para os mercados BTC de 15 min.
- https://github.com/karlstuke1/polymarket-5min-btc-up-down: mesmo tipo de mercado (BTC Up/Down 5 min).
