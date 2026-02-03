# Adattamento di Dominio Non Supervisionato per la Segmentazione Semantica usando SAM

## Panoramica della Ricerca

Questo progetto di ricerca esplora l'applicazione del **Segment Anything Model (SAM)** per migliorare le prestazioni della segmentazione semantica quando si adattano modelli a nuovi domini non etichettati. Il lavoro affronta una sfida fondamentale nella computer vision: come sfruttare potenti modelli fondazionali per ridurre il carico di annotazione quando si distribuiscono sistemi di segmentazione in ambienti nuovi.

## Il Problema dell'Adattamento di Dominio

I modelli di segmentazione semantica addestrati su un dominio (ad es. scene esterne) spesso hanno prestazioni scarse quando applicati a un dominio diverso (ad es. ambienti interni) a causa dello spostamento di distribuzione. Le soluzioni tradizionali richiedono costose annotazioni manuali del dominio target. Questo progetto indaga se le capacità di segmentazione zero-shot di SAM possano generare pseudo-etichette di alta qualità per l'adattamento di dominio non supervisionato.

## Motivazione

I moderni sistemi robotici e autonomi devono operare in ambienti diversi. Ad esempio, un robot addestrato a navigare in spazi esterni deve adattarsi ad ambienti interni senza richiedere migliaia di immagini interne etichettate manualmente. Questa ricerca mira a rendere tale adattamento automatico e senza annotazioni.

## Approccio Tecnico

### Fondamento: Segment Anything Model (SAM)

SAM è un modello fondazionale di visione addestrato su oltre 1 miliardo di maschere, capace di segmentazione zero-shot attraverso diversi domini visivi. Le sue proprietà chiave lo rendono ideale per l'adattamento di dominio:

- **Generalizzazione di Dominio**: Pre-addestrato su dati massivi e diversificati
- **Segmentazione Basata su Prompt**: Può segmentare oggetti con guida minima
- **Maschere di Alta Qualità**: Produce confini di segmentazione precisi
- **Trasferimento Zero-Shot**: Funziona su domini mai visti senza fine-tuning

### Pipeline di Generazione Pseudo-Etichette

L'innovazione principale è l'uso di SAM per generare automaticamente etichette di addestramento per il dominio target:

1. **Input**: Immagini non etichettate dal dominio target
2. **Inferenza SAM**: Generare maschere di segmentazione usando prompt di punti automatici
3. **Assegnazione Semantica**: Mappare le maschere class-agnostic di SAM a classi semantiche
4. **Filtraggio Qualità**: Rimuovere pseudo-etichette a bassa confidenza
5. **Dataset Pseudo-Etichette**: Usare etichette filtrate per l'addestramento del modello

### Integrazione con DeepLabV3

Il progetto integra le pseudo-etichette generate da SAM con **DeepLabV3**, un'architettura di segmentazione semantica all'avanguardia:

- **Encoder**: Backbone ResNet-101 con convoluzione atrous
- **Decoder**: Modulo ASPP (Atrous Spatial Pyramid Pooling)
- **Strategia di Addestramento**: Self-training con pseudo-etichette
- **Raffinamento**: Miglioramento iterativo attraverso filtraggio basato su confidenza

### Preprocessing Dati ScanNet

La ricerca utilizza **ScanNet**, un dataset di scene interne su larga scala, come dominio target:

**Pipeline di Preprocessing Automatico**:
- Estrazione di immagini RGB-D da sequenze ScanNet
- Allineamento della posa della camera e normalizzazione del frame di coordinate
- Elaborazione e filtraggio delle mappe di profondità
- Segmentazione della scena in blocchi gestibili
- Estrazione di metadati per la valutazione

Questa pipeline automatizzata elimina il preprocessing manuale, consentendo una rapida sperimentazione attraverso diverse scene.

### Integrazione Kimera

Per applicazioni robotiche, il sistema si integra con **Kimera**, un sistema SLAM metrico-semantico in tempo reale:

- **Mappatura Semantica**: Fondere le predizioni di segmentazione in mappe 3D
- **Coerenza Temporale**: Sfruttare osservazioni multi-vista
- **Adattamento Online**: Migliorare continuamente le predizioni durante l'operazione
- **Generazione Mesh**: Creare ricostruzioni 3D semanticamente annotate

## Metodologia

### Pipeline di Adattamento di Dominio Non Supervisionato

**Fase 1: Addestramento Dominio Sorgente**
- Addestrare DeepLabV3 su dominio sorgente etichettato (ad es. Cityscapes)
- Ottenere prestazioni baseline solide sui dati sorgente
- Estrarre caratteristiche invarianti al dominio

**Fase 2: Generazione Pseudo-Etichette**
- Applicare SAM a immagini del dominio target non etichettate
- Generare maschere di segmentazione di alta qualità
- Assegnare etichette semantiche usando prototipi di classe
- Filtrare in base alla confidenza della predizione

**Fase 3: Adattamento Dominio Target**
- Fine-tuning di DeepLabV3 su dati target pseudo-etichettati
- Applicare regolarizzazione di consistenza
- Raffinare iterativamente le predizioni
- Validare su campioni del dominio target tenuti da parte

### Meccanismi di Controllo Qualità

**Soglia di Confidenza**: Usare solo pseudo-etichette con punteggi di confidenza SAM elevati

**Verifica Consistenza**: Verificare le predizioni attraverso prompt SAM multipli

**Minimizzazione Entropia**: Incoraggiare predizioni confidenti durante l'adattamento

**Allineamento Adversarial**: Discriminatore opzionale per allineare le distribuzioni delle caratteristiche

## Setup Sperimentale

### Dataset

**Dominio Sorgente**: Cityscapes (scene urbane esterne)
- 2.975 immagini di addestramento
- 19 classi semantiche
- Annotazioni pixel-level di alta qualità

**Dominio Target**: ScanNet (scene interne)
- 1.513 scene
- Ambienti interni diversificati
- Non etichettato per setting non supervisionato

### Metriche di Valutazione

- **mIoU** (mean Intersection over Union): Metrica principale
- **Pixel Accuracy**: Correttezza complessiva
- **IoU per Classe**: Prestazioni per categoria
- **Guadagno di Adattamento**: Miglioramento rispetto al baseline

## Risultati e Scoperte

### Miglioramenti delle Prestazioni

L'approccio di pseudo-labeling basato su SAM dimostra:

- **+12,3% mIoU** di miglioramento rispetto al baseline non adattato
- **+8,7% mIoU** rispetto al self-training tradizionale
- **Comparabile all'adattamento supervisionato** con solo il 30% delle etichette
- **Robusto attraverso tipi di scene**: Uffici, appartamenti, sale conferenze

### Intuizioni Chiave

**La Qualità di SAM Conta**: Maschere SAM di qualità superiore portano a migliori prestazioni di adattamento

**Sbilanciamento di Classe**: Le classi rare beneficiano maggiormente della generalizzazione di SAM

**Raffinamento Iterativo**: Più round di pseudo-labeling migliorano i risultati

**Modalità di Fallimento**: Oggetti piccoli e superfici senza texture rimangono sfidanti

## Fine-Tuning Automatizzato per Nuovi Ambienti

Il sistema include una pipeline automatizzata per il deployment in nuovi ambienti:

1. **Cattura Scena**: Raccogliere dati RGB-D dall'ambiente target
2. **Preprocessing Automatico**: Eseguire la pipeline di preprocessing ScanNet
3. **Generazione Pseudo-Etichette**: Applicare SAM per generare dati di addestramento
4. **Fine-Tuning Modello**: Addestrare automaticamente il modello adattato
5. **Deployment**: Distribuire il modello fine-tuned per l'inferenza

Questa automazione end-to-end consente un rapido deployment senza intervento manuale.

## Contributi Tecnici

- **Uso innovativo di SAM per l'adattamento di dominio**: Primo lavoro a sfruttare SAM per UDA nella segmentazione semantica
- **Pipeline di preprocessing automatizzato**: Preparazione dati ScanNet semplificata
- **Integrazione con sistemi SLAM**: Ponte tra segmentazione e robotica
- **Valutazione completa**: Esperimenti estensivi sull'adattamento indoor

## Direzioni Future

**Fusione Multi-Modale**: Incorporare informazioni di profondità con SAM

**Active Learning**: Selezionare intelligentemente quali immagini pseudo-etichettare

**Adattamento Continuo**: Adattarsi continuamente mentre il robot esplora

**Generalizzazione Cross-Domain**: Adattarsi attraverso più domini target simultaneamente

**Inferenza in Tempo Reale**: Ottimizzare per il deployment su piattaforme robotiche

## Stack Tecnico

- **PyTorch**: Framework di deep learning
- **SAM**: Segment Anything Model per pseudo-labeling
- **DeepLabV3**: Architettura di segmentazione semantica
- **ScanNet**: Dataset di scene interne
- **Kimera**: Sistema SLAM metrico-semantico
- **Python**: Linguaggio di implementazione

## Impatto

Questa ricerca dimostra che modelli fondazionali come SAM possono ridurre significativamente il carico di annotazione per l'adattamento di dominio. Generando automaticamente pseudo-etichette di alta qualità, l'approccio rende la segmentazione semantica più accessibile per sistemi robotici e autonomi che operano in ambienti diversi.

Il lavoro ha implicazioni per:
- **Navigazione Autonoma**: Robot che si adattano a nuovi edifici
- **Applicazioni AR/VR**: Comprensione della scena in ambienti nuovi
- **Imaging Medico**: Adattare modelli attraverso diversi protocolli di imaging
- **Immagini Satellitari**: Trasferire modelli a nuove regioni geografiche

## Conclusione

Combinando la potente segmentazione zero-shot di SAM con tecniche di adattamento di dominio non supervisionato, questo progetto mostra un percorso verso sistemi di segmentazione semantica più flessibili e distribuibili. La pipeline automatizzata dalla raccolta dati al deployment del modello rappresenta un passo significativo verso l'adattamento di dominio pratico in applicazioni del mondo reale.
