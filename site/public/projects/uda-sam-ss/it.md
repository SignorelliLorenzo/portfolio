# Raffinamento delle Pseudo-Label nell'Unsupervised Domain Adaptation tramite SAM2

## Panoramica
Quando un robot (o qualunque sistema di visione) viene addestrato in un ambiente e poi distribuito in un contesto diverso, la qualità della percezione cala rapidamente a causa del **domain shift**: la distribuzione dei dati in deployment differisce da quella di addestramento (sensori diversi, illuminazione, layout, texture, ecc.).

<table>
  <tr>
    <td style="text-align:center;">
      <img src="/projects/uda-sam-ss/assets/baseline.gif" alt="Pseudo-label baseline" style="width:100%; max-width:360px; border-radius:24px;" />
      <div><em>Proiezione pseudo-label baseline</em></div>
    </td>
    <td style="text-align:center;">
      <img src="/projects/uda-sam-ss/assets/refined.gif" alt="Pseudo-label raffinate" style="width:100%; max-width:360px; border-radius:24px;" />
      <div><em>Pseudo-label raffinate con SAM2</em></div>
    </td>
  </tr>
</table>

Questo progetto riguarda la **segmentazione semantica** per la robotica, e in particolare l'**Unsupervised Domain Adaptation (UDA)** in cui il dominio target è **non etichettato**. In UDA una strategia diffusa è creare **pseudo-label** (etichette generate automaticamente) e usarle come supervisione per adattare il modello.

### Che cos'è l'Unsupervised Domain Adaptation (UDA)?
L'**Unsupervised Domain Adaptation** affronta il problema di adattare un modello da un **dominio sorgente etichettato** (dove abbiamo annotazioni) a un **dominio target non etichettato**, mentre l'input cambia distribuzione per via del domain shift.

In pratica significa:

- Si addestra su un dataset (sorgente) con ground truth.
- Si distribuisce in un ambiente/dataset diverso (target) **senza etichette**.
- Si migliorano le prestazioni nel dominio target sfruttando la struttura dei dati (pseudo-labeling, consistenza, vincoli multi-view/3D) invece di annotazioni manuali.

### Perché l'UDA è importante
L'UDA è cruciale in robotica perché gli ambienti di deployment cambiano continuamente e raccogliere etichette pixel-level per ogni nuova casa/ufficio/scena è lento e costoso. Una pipeline UDA robusta può:

- Ridurre o eliminare la necessità di nuove annotazioni.
- Consentire una distribuzione più rapida in ambienti mai visti.
- Migliorare sicurezza e autonomia mantenendo una percezione affidabile al variare delle condizioni.

L'idea centrale di questo lavoro è:

- Partire da una pipeline UDA 2D–3D consolidata che genera pseudo-label fondendo predizioni 2D in una mappa semantica 3D.
- Migliorare quelle pseudo-label con uno stadio di raffinamento basato su **Segment Anything Model (SAM2)**, un potente foundation model di segmentazione *zero-shot*.

Il metodo migliora l'accuratezza dei contorni e riduce gli artefatti indotti dai voxel, soprattutto quando il sistema usa mappe voxel 3D più grossolane per vincoli real-time.

<img src="/projects/uda-sam-ss/assets/pipeline_diagram.png" alt="Panoramica della pipeline" style="width:100%; border-radius:28px; background:#fff; padding:18px;" />

## Impostazione del Problema
### Segmentazione semantica per la robotica
La segmentazione semantica assegna una classe a **ogni pixel** dell'immagine. Questa comprensione densa è fondamentale per:

- Navigazione in ambienti indoor ingombri
- Manipolazione e interazione con gli oggetti
- Costruzione di mappe semantiche per il planning

### Perché il domain shift è critico
Anche le architetture moderne di segmentazione possono fallire nel generalizzare quando:

- La camera è diversa
- Cambia l'illuminazione (indoor/outdoor, giorno/notte)
- Cambia la composizione della scena (case, uffici, laboratori)

In robotica, etichettare manualmente nuovi ambienti è costoso e spesso impraticabile. Per questo l'**UDA** è particolarmente attrattiva.

### Perché le pseudo-label sono il collo di bottiglia
Le pipeline UDA fanno spesso affidamento su pseudo-label prodotte da un modello addestrato nel dominio sorgente. All'inizio dell'adattamento queste pseudo-label sono **rumorose**, e gli errori possono propagarsi nell'addestramento.

Questo lavoro si concentra su una pipeline di pseudo-labeling che sfrutta la mappatura 3D per imporre coerenza temporale e di vista, ma soffre comunque di **imprecisione spaziale** dovuta a voxelizzazione e proiezione.

## Pipeline di Base: DeepLabV3 + Kimera + Ray Casting
Il progetto si basa sul framework di adattamento continuo di Frey et al. (semantic mapping con Kimera) e utilizza i checkpoint e la configurazione di addestramento di Liu et al. (neural rendering continual UDA) come baseline coerente.

A livello alto:

1. **Segmentazione 2D**: un modello DeepLabV3 produce predizioni semantiche per frame.
2. **Fusione semantica 3D**: Kimera integra frame RGB-D e predizioni in una mappa semantica voxel tramite fusione bayesiana.
3. **Proiezione delle pseudo-label**: il ray casting proietta la mappa voxel semantica 3D nel piano immagine, producendo pseudo-label allineate a ciascun frame RGB.
4. **Apprendimento continuo**: le pseudo-label supervisionano l'ulteriore fine-tuning per adattarsi al nuovo dominio.

Il vantaggio principale è la **consistenza semantica globale**: la fusione riduce l'impatto degli errori sul singolo frame. Lo svantaggio principale è che la voxelizzazione introduce artefatti.

## Trade-off sulla Risoluzione dei Voxel (3 cm vs 5 cm)
La dimensione del voxel è un trade-off ingegneristico chiave:

- **Voxel da 3 cm** preservano più dettaglio e bordi, ma richiedono più memoria e calcolo.
- **Voxel da 5 cm** sono più efficienti e realistici per vincoli real-time, ma portano pseudo-label più "a blocchi" e rumorose.

### Qualità delle mappe voxel semantiche
<table>
  <tr>
    <td>
      <img src="/projects/uda-sam-ss/assets/mesh3.png" alt="Mappa voxel semantica 3 cm" style="width:100%; max-width:280px; border-radius:24px;" />
      <div><em>Mappa voxel semantica (3 cm)</em></div>
    </td>
    <td>
      <img src="/projects/uda-sam-ss/assets/mesh5.png" alt="Mappa voxel semantica 5 cm" style="width:100%; max-width:280px; border-radius:24px;" />
      <div><em>Mappa voxel semantica (5 cm)</em></div>
    </td>
  </tr>
</table>

### Come degradano le proiezioni delle pseudo-label a 5 cm
Di seguito alcune comparazioni delle pseudo-label *proiettate* prodotte da mappe voxel da 3 cm e 5 cm sulla stessa scena. La proiezione da 5 cm tende a perdere strutture sottili e a sfumare i bordi.

<table>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/1001_3.png" alt="Proiezione 3 cm 1001" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>3 cm</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1001_5.png" alt="Proiezione 5 cm 1001" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>5 cm</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1771_3.png" alt="Proiezione 3 cm 1771" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>3 cm</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1771_5.png" alt="Proiezione 5 cm 1771" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>5 cm</em></div></td>
  </tr>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/3543_3.png" alt="Proiezione 3 cm 3543" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>3 cm</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/3543_5.png" alt="Proiezione 5 cm 3543" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>5 cm</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/4756_3.png" alt="Proiezione 3 cm 4756" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>3 cm</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/4756_5.png" alt="Proiezione 5 cm 4756" style="width:100%; max-width:220px; border-radius:24px;" /><div><em>5 cm</em></div></td>
  </tr>
</table>

Empiricamente, sulle scene valutate, usare una mappa voxel da 3 cm offre un miglioramento medio di **+1,84 mIoU** rispetto alla configurazione da 5 cm (prima del raffinamento SAM), ma a un costo computazionale molto più alto.

## Estensione Proposta: Raffinamento delle Pseudo-Label con SAM2
Per ridurre gli artefatti indotti dai voxel mantenendo i benefici di mappe più grossolane, ho introdotto uno stadio di raffinamento basato su **SAM2**.

SAM2 è un modello di segmentazione zero-shot capace di produrre maschere di alta qualità se opportunamente "promptato". La sfida è che SAM non è intrinsecamente consapevole delle classi (segmenta *regioni*), mentre l'obiettivo è una segmentazione **semantica**.

Questo progetto risolve il problema:

- Usando SAM2 per generare maschere più nitide, simili a istanze.
- Trasferendo le classi semantiche dalle pseudo-label originali a quelle maschere.
- Tornando alle pseudo-label originali quando SAM2 non fornisce maschere.

### Pseudo-label di Kimera vs etichette raffinate da SAM
Gli esempi seguenti mostrano come il raffinamento SAM tenda ad affinare i bordi e a separare meglio gli oggetti.

<table>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/2_p.png" alt="Pseudo-label Kimera" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label Kimera</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/2_s.png" alt="SAM raffinato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>SAM raffinato</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/448_p.png" alt="Pseudo-label Kimera" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label Kimera</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/448_s.png" alt="SAM raffinato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>SAM raffinato</em></div></td>
  </tr>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/496_p.png" alt="Pseudo-label Kimera" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label Kimera</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/496_s.png" alt="SAM raffinato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>SAM raffinato</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/624_p.png" alt="Pseudo-label Kimera" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label Kimera</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/624_s.png" alt="SAM raffinato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>SAM raffinato</em></div></td>
  </tr>
</table>

## Prompting di SAM2: due strategie
SAM richiede prompt. La tesi valuta due approcci di prompting automatico.

### 1) Prompting "calcolato" (conservativo)
Il prompting calcolato è guidato dalla struttura delle pseudo-label attuali. Per ciascuna componente connessa (regione con la stessa etichetta nelle pseudo-label) si calcolano:

- Un **bounding box**
- Un **centroide** (spostato per cadere su un pixel valido della label target)

Si applicano poi euristiche per migliorare la robustezza:

- **Erd (hereditary)**: se SAM lascia regioni non etichettate (nere/vuote), si copiano quei pixel dalla pseudo-label originale.
- **Ns (no small)**: si scartano componenti connesse piccole per ridurre il rumore, specialmente nelle pseudo-label molto frammentate ("Picasso").
- **nWm (no wall/floor majority fill)**: muri e pavimenti possono portare SAM a mascherare grandi porzioni; per queste classi si evita il riempimento a maggioranza che potrebbe etichettare male vaste aree.

Questa configurazione, selezionata dopo ablation study, rappresenta un compromesso solido e stabile.

### 2) Prompting a griglia (aggressivo)
Il prompting a griglia posiziona una griglia uniforme di punti sull'immagine. Ogni punto funge da prompt; SAM produce più maschere, fuse dalla più grande alla più piccola. Questa strategia:

- Riduce la dipendenza dalla qualità delle pseudo-label.
- Migliora spesso i bordi in modo significativo.
- Può fallire gravemente in alcune scene, perché si affida maggiormente alla segmentazione "grezza" di SAM.

### Confronto visivo: griglia vs prompting calcolato
<table>
  <tr>
    <td>
      <img src="/projects/uda-sam-ss/assets/grid.png" alt="Prompting a griglia" style="width:100%; max-width:280px; border-radius:24px;" />
      <div><em>Prompting a griglia</em></div>
    </td>
    <td>
      <img src="/projects/uda-sam-ss/assets/prompted.png" alt="Prompting calcolato" style="width:100%; max-width:280px; border-radius:24px;" />
      <div><em>Prompting calcolato</em></div>
    </td>
  </tr>
</table>

## Fusione delle maschere: dalle regioni SAM alle etichette semantiche
Una volta che SAM produce le maschere, si costruisce la mappa semantica finale:

- Per i pixel all'interno di una maschera SAM si assegna una classe usando la distribuzione delle pseudo-label interne (maggioranza/trasferimento coerente).
- Per casi difficili (es. muri/pavimenti) si applicano logiche di riempimento più sicure per evitare che una sola maschera sovra-segmentata domini.
- Per i pixel non coperti da alcuna maschera SAM si torna alla pseudo-label precedente (**Erd**).

Questa progettazione mantiene i benefici del raffinamento evitando che SAM corrompa aree vaste quando sbaglia.

## Note di Implementazione
L'intera pipeline è implementata in modo modulare su ROS:

- Ogni fase è un nodo ROS (inferenza di segmentazione, mapping, ray tracing, raffinamento SAM e controllo).
- Un nodo di controllo dedicato gestisce sincronizzazione, flusso delle immagini e comunicazione.

Scelte di configurazione chiave:

- **Backbone**: DeepLabV3 con ResNet-101 (PyTorch).
- **Risoluzioni di input**:
  - Pipeline principale ridimensionata a **320×240** per efficienza.
  - Raffinamento SAM testato sia a **320×240** sia alla risoluzione originale **1296×968**.
- **Voxel size**: esperimenti con **3 cm** e **5 cm**.
- **Dataset**: **ScanNet** (scene indoor RGB-D con ground truth semantica).

## Esperimenti
### Riproduzione della baseline di mapping
Per validare l'integrità della pipeline ho riprodotto lo step di mapping/generazione pseudo-label usando il checkpoint pubblico del lavoro neural-rendering UCDA. I risultati seguono le tendenze del paper originale, anche se i numeri esatti differiscono leggermente.

Un riassunto sulle scene 0–5 mostra come la qualità delle pseudo-label dipenda dalla dimensione del voxel:

<table>
  <thead>
    <tr>
      <th>Scena</th>
      <th>DeepLab (mIoU)</th>
      <th>Pseudo 5 cm (mIoU)</th>
      <th>Pseudo 3 cm (mIoU)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0</td><td>41,2</td><td>48,1</td><td>48,4</td></tr>
    <tr><td>1</td><td>36,0</td><td>28,8</td><td>33,0</td></tr>
    <tr><td>2</td><td>23,7</td><td>26,0</td><td>27,6</td></tr>
    <tr><td>3</td><td>62,9</td><td>63,9</td><td>66,8</td></tr>
    <tr><td>4</td><td>49,8</td><td>42,6</td><td>49,7</td></tr>
    <tr><td>5</td><td>48,7</td><td>49,3</td><td>52,2</td></tr>
    <tr><td><strong>Media</strong></td><td><strong>43,7</strong></td><td><strong>43,1</strong></td><td><strong>46,3</strong></td></tr>
  </tbody>
</table>

### Ablation sulla strategia calcolata (takeaway chiave)
Le prime prove hanno identificato failure mode tipici di SAM per questo task:

- Maschere incomplete (regioni non segmentate)
- Classi "stuff" problematiche come muri/pavimenti
- Deriva del centroide fuori dall'oggetto
- Pseudo-label "Picasso" iper-frammentate che producono troppe piccole regioni

Una scoperta critica è che riempire le regioni non segmentate votando la maggioranza (**Max**) è inaffidabile, quindi la pipeline usa **Erd (hereditary)** come base.

La configurazione **Erd + Ns + nWm**, individuata tramite ablation, migliora leggermente la mIoU media sulle scene 0–5 (valutazione campionata):

- Media pseudo 3 cm: **46,3**
- Media SAM (Erd + Ns + nWm): **46,8**

### Protocollo di valutazione completo
La valutazione finale usa:

- Scene **0–9**
- Circa **80% dei frame validi** per scena (escludendo quelli senza ground truth utilizzabile)
- Metrica: **mIoU** rispetto alla ground truth di ScanNet

### Risultati quantitativi (ΔmIoU rispetto alle pseudo-label)
Il risultato principale è che il raffinamento migliora sistematicamente le pseudo-label, con benefici maggiori per mappe voxel più grossolane (5 cm) perché c'è più margine di correzione.

<img src="/projects/uda-sam-ss/assets/3cmBar.png" alt="Miglioramenti per scena a 3 cm" style="width:100%; border-radius:28px;" />

<img src="/projects/uda-sam-ss/assets/5cmBar.png" alt="Miglioramenti per scena a 5 cm" style="width:100%; border-radius:28px;" />

Sintesi su tutte le scene (media e deviazione standard del miglioramento):

<table>
  <thead>
    <tr>
      <th>Voxel size</th>
      <th>Prompting</th>
      <th>ΔmIoU medio</th>
      <th>Dev. std.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>3 cm</td><td>Calcolato</td><td>0,71</td><td>0,90</td></tr>
    <tr><td>3 cm</td><td>Griglia</td><td>0,69</td><td>1,62</td></tr>
    <tr><td>5 cm</td><td>Calcolato</td><td>1,77</td><td>1,26</td></tr>
    <tr><td>5 cm</td><td>Griglia</td><td>1,85</td><td>2,09</td></tr>
  </tbody>
</table>

Interpretazione:

- I **5 cm** beneficiano maggiormente del raffinamento (miglioramenti più grandi).
- La **griglia** ha un miglioramento medio leggermente superiore, ma anche una varianza molto più ampia (meno stabile).
- Il prompting **calcolato** è più coerente e sicuro per il deployment.

## Risultati qualitativi
Tutti gli esempi qualitativi riportati usano la configurazione che ha performato meglio nei nostri esperimenti: **voxel da 5 cm** con **RGB ad alta risoluzione**.

Ogni riga mostra:

1. Ground truth (ScanNet)
2. Pseudo-label originale
3. Raffinamento SAM con prompting a griglia
4. Raffinamento SAM con prompting calcolato

### Raffinamento riuscito
<table>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/1538_gt_good.png" alt="GT" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Ground truth</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1538_ps_good.png" alt="Pseudo" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1538_sA_good.png" alt="Griglia" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Griglia</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1538_sC_good.png" alt="Calcolato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Calcolato</em></div></td>
  </tr>
</table>

### Quando il prompting calcolato è migliore
<table>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/4524_gt_Cb.png" alt="GT" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Ground truth</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/4524_ps_Cb.png" alt="Pseudo" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/4524_sA_Cb.png" alt="Griglia" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Griglia</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/4524_sC_Cb.png" alt="Calcolato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Calcolato</em></div></td>
  </tr>
</table>

### Quando il prompting a griglia è migliore
<table>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/1762_gt_Ab.png" alt="GT" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Ground truth</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1762_ps_Ab.png" alt="Pseudo" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1762_sA_Ab.png" alt="Griglia" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Griglia</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/1762_sC_Ab.png" alt="Calcolato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Calcolato</em></div></td>
  </tr>
</table>

### Caso di fallimento (errore propagato da SAM)
<table>
  <tr>
    <td><img src="/projects/uda-sam-ss/assets/453_gt_bad.png" alt="GT" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Ground truth</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/453_ps_bad.png" alt="Pseudo" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Pseudo-label</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/453_sA_bad.png" alt="Griglia" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Griglia</em></div></td>
    <td><img src="/projects/uda-sam-ss/assets/453_sC_bad.png" alt="Calcolato" style="width:100%; max-width:200px; border-radius:24px;" /><div><em>Calcolato</em></div></td>
  </tr>
</table>

Questi esempi evidenziano un trade-off importante:

- Il **prompting a griglia** può produrre raffinamenti più forti ma è più vulnerabile agli errori di SAM.
- Il **prompting calcolato** è più conservativo e stabile, ma dipende maggiormente dalla qualità delle pseudo-label iniziali.

## Limiti
- **SAM non è infallibile**: se fallisce nel segmentare un oggetto chiave, il raffinamento può peggiorare la mappa.
- **Sensibilità al posizionamento dei prompt**: piccoli errori su centroidi o bounding box possono generare maschere errate.
- **Budget computazionale**: esecuzioni SAM ad alta risoluzione migliorano la coerenza ma costano più tempo.

## Lavori Futuri
Il passo più promettente è integrare lo stadio di raffinamento in un ciclo di **addestramento continuo online**:

- raffinare le pseudo-label con SAM2
- fine-tuning online di DeepLabV3
- iterare man mano che il robot esplora

Ulteriori miglioramenti di robustezza suggeriti dagli esperimenti:

- Selezione dei prompt e rifiuto delle maschere a rischio basati su incertezza
- Vincoli/prior class-aware durante la fusione maschere-label
- Strategie di prompting dinamiche condizionate sul contenuto della scena

## Conclusione
Questo progetto dimostra che un foundation model come **SAM2** può migliorare in modo significativo la qualità delle pseudo-label in una pipeline UDA 2D–3D.

L'indicazione pratica più forte è che il raffinamento SAM è particolarmente prezioso per mappe voxel più grossolane da **5 cm**, dove le pseudo-label sono più economiche da produrre ma anche più degradate. Con un prompting attento e una logica di fallback conservativa (Erd), SAM2 diventa un componente potente per ridurre la necessità di annotazioni e aumentare la robustezza della percezione robotica nel mondo reale.
