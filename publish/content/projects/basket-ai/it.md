# Basket-AI: Costruire un Sistema di Tracciamento Basket a Basso Costo con l'AI

*Autore: Lorenzo Signorelli*

---

## Visione e Obiettivi del Progetto

I campionati professionistici come l'NBA utilizzano sistemi avanzati di tracciamento basati su più telecamere ad alta risoluzione, sensori proprietari e pipeline dati complesse. Queste soluzioni generano insight straordinari su movimenti dei giocatori, fisica della palla e tattiche di squadra, ma i costi elevatissimi le rendono irraggiungibili per la maggior parte delle federazioni nazionali e dei club minori.

In Italia, l'analisi delle partite è ancora manuale. Allenatori e analisti devono riguardare i video per estrarre statistiche di base, con processi lenti e soggettivi.

**Basket-AI** nasce come iniziativa di ricerca per offrire un'alternativa accessibile e automatizzata. L'obiettivo è supportare—non sostituire—gli staff tecnici, automatizzando le attività ripetitive e fornendo dati oggettivi.

---

## Architettura del Sistema

### 1. Rilevamento dei Giocatori
**Obiettivo:** identificare e localizzare tutti i giocatori in ogni frame.  
*   **Modello:** YOLOv11 (variante nano per bilanciare velocità e accuratezza).  
*   **Dataset:** ~1.500 immagini annotate manualmente.  
*   **Setup Telecamere:** due telecamere statiche dall'alto per minimizzare le occlusioni.  
*   **Risultato:** bounding box stabili in condizioni di luce diverse.  

![Player_Tracking](/api/assets/basket-ai/88_labeled_top_corrected.png)

---

### 2. Tracciamento della Palla
**Obiettivo:** seguire un oggetto piccolo e velocissimo.  
*   **Sfida:** la palla è spesso occlusa da mani o corpi.  
*   **Modello:** YOLO dedicato, addestrato su immagini concentrate sulla palla.  
*   **Risultato:** localizzazione affidabile con rare perdite in caso di blur estremo.  

---

### 3. Identificazione delle Squadre (Segmentazione + Clustering)
**Obiettivo:** assegnare ogni giocatore alla squadra corretta in base alla maglia.  
*   **Problema iniziale:** il clustering cromatico diretto soffriva i colori dello sfondo.  
*   **Pipeline in due fasi**
    1.  **Segmentazione accurata:** SAM2, guidato dalle bounding box YOLO, produce maschere pixel-level eliminando lo sfondo.  
    2.  **Clustering robusto:** K-Means + istogrammi colore su immagini segmentate, con bias quando i colori delle squadre sono noti.  

<video
  src="/api/assets/basket-ai/teams.mp4"
  autoplay
  loop
  muted
  playsinline
  class="w-full rounded-xl border border-neutral-800/40 shadow-lg my-6"
>
  Il tuo browser non supporta il tag video.
</video>

---

### 4. Riconoscimento dei Numeri di Maglia
**Obiettivo:** identificare il numero per assegnare un'ID univoca.  
*   **Problema:** OCR standard fallisce con font particolari e tessuti piegati.  
*   **Pipeline:**
    1.  **Localizzazione:** YOLO addestrato sulla zona della schiena.  
    2.  **Riconoscimento:** crop della regione e inferenza con PARSeq.  
*   **Prestazioni:** **79% di accuratezza** su un test di 131 immagini.  

![Team_tracking](/api/assets/basket-ai/grafico.png)

---

### 5. Multi-Object Tracking (MOT) – Il Nodo Cruciale  
**Obiettivo:** mantenere un'identità coerente per ogni giocatore e per la palla lungo tutto il video.  

*   **Modello testato:** ByteTrack con filtro di Kalman e matching di apparenza.  
*   **Ostacoli principali:**
    *   **Somiglianza visiva:** dall'alto i giocatori della stessa squadra risultano quasi identici.  
    *   **Occlusioni & movimenti improvvisi:** frequenti collisioni rompono le ipotesi del filtro di Kalman.  
*   **Risultato:** numerosi **ID switch** e tracce frammentate, rendendo instabili le statistiche derivate.  
*   **Stato del progetto:** il cliente ha interrotto il finanziamento per carenza di risorse (hardware + setup).  

---

> **Nota:** senza un MOT stabile non è stato possibile procedere con funzionalità successive come la stima della posa.  

---

### 6. Stima della Posa *(Non Avviata)*  
**Obiettivo:** analizzare gesti tecnici (salti, difesa, tiro) tramite stime scheletriche.  

*   **Status:** sospeso in attesa di un MOT affidabile.  
*   **Possibile evoluzione:** modelli leggeri tipo YOLO-Pose una volta stabilizzato il tracciamento.  

<p align="center">  
  <img src="/api/assets/basket-ai/pose.webp" alt="Stima della Posa" width="500" style="margin-bottom:5px"/>  
  <em>Fonte: <a href="https://posetrack.net/">PoseTrack</a></em>  
</p>  

---

## Risultati e Metriche

<table>
  <thead>
    <tr>
      <th>Task</th>
      <th>Metodologia</th>
      <th>Outcome & Note</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Rilevamento Giocatori</td>
      <td>YOLOv11 fine-tuned</td>
      <td><strong>Stabile.</strong> Alta precisione nella vista dall'alto.</td>
    </tr>
    <tr>
      <td>Rilevamento Palla</td>
      <td>YOLO dedicato</td>
      <td><strong>Affidabile.</strong> Cadute solo in caso di occlusioni estreme.</td>
    </tr>
    <tr>
      <td>Identificazione Squadre</td>
      <td>SAM2 + K-Means + Istogrammi</td>
      <td><strong>Robusta.</strong> Dipende dalla qualità della segmentazione.</td>
    </tr>
    <tr>
      <td>Riconoscimento Numeri</td>
      <td>YOLO + PARSeq</td>
      <td><strong>79% Accuratezza.</strong> Funziona bene con numeri visibili.</td>
    </tr>
    <tr>
      <td>Stima della Posa</td>
      <td>YOLO-Pose / OpenPose</td>
      <td><strong>Non avviata.</strong> In attesa di MOT stabile.</td>
    </tr>
    <tr>
      <td>Multi-Object Tracking</td>
      <td>ByteTrack</td>
      <td><strong>Instabile.</strong> Troppi ID switch per uso affidabile.</td>
    </tr>
  </tbody>
</table>

---

## Conclusioni & Prospettive

Basket-AI dimostra che elementi chiave dei sistemi professionali possono essere replicati con AI moderna e budget sostenibili. Il pipeline copre rilevamento giocatori, localizzazione palla, assegnazione squadra e riconoscimento numeri.

Il blocco principale rimane il **Multi-Object Tracking**: senza un MOT robusto è impossibile passare da detection frame-by-frame a una vera comprensione temporale.

*   **Sport:** analisi di schemi offensivi completi e metriche di carico di lavoro.  
*   **Autonomous Driving:** previsione delle traiettorie nel tempo.  
*   **Retail/Sicurezza:** studio dei flussi di persone su sessioni complete.  

Rendere il MOT affidabile democratizzerà queste analisi avanzate, portandole oltre i budget dei grandi campionati. Anche se il progetto è in pausa, Basket-AI resta una prova concreta di ciò che è possibile con un approccio metodico e strumenti open-source.
