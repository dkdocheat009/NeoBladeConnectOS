---
name: fidelidade-visual
description: Aplicar ao reproduzir telas do NeoBladeConnectOS com fidelidade pixel a pixel a partir das capturas locais. Usar antes da implementação e na revisão visual de cada tela.
---

# Fluxo de fidelidade visual

1. Abra a captura original (início: `referencias/Fotos/bilder/home.png`) e examine a imagem em resolução nativa: medidas, bordas, cores, espaçamentos, fundo, tipografia, ícones e estados.
2. Implemente layout real em React/CSS na viewport base de **1280×720**. A imagem serve de referência, não de tela estática pronta. Não acrescente nem redesenhe elementos por gosto; se algum detalhe não puder ser reproduzido, registre a limitação.
3. Use Playwright (biblioteca de teste; instale apenas se necessário) para renderizar e salvar a tela produzida em **1280×720**. Compare com a captura, visualmente e/ou por diff de imagem. Ajuste as diferenças mais visíveis e repita.
4. Verifique os comportamentos visíveis da Home (hover/toque, paginação e dock) sem inventar aplicativos novos. Não derive animações inexistentes apenas de uma foto.
5. Só declare conclusão após conferir build, screenshot final e fidelidade. Relate objetivamente qualquer diferença restante.
